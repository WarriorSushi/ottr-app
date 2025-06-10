/**
 * Message Service
 * 
 * Handles all message-related operations with Supabase:
 * - Sending messages
 * - Retrieving message history
 * - Marking messages as read
 * - Real-time subscriptions for messages and typing indicators
 */

import { supabase } from './supabaseClient';
import { Message } from '../../types/database';

// Default pagination limit
const DEFAULT_LIMIT = 20;

/**
 * Send a message from one user to another
 */
export const sendMessage = async (
  fromUserId: string, 
  toUserId: string, 
  content: string
): Promise<{ success: boolean; data?: Message; error?: string }> => {
  try {
    // Validate input
    if (!content.trim()) {
      return { success: false, error: 'Message content cannot be empty' };
    }
    
    if (content.length > 500) {
      return { success: false, error: 'Message is too long (max 500 characters)' };
    }
    
    // Create the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        from_user: fromUserId,
        to_user: toUserId,
        content: content.trim(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending message:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send message' 
    };
  }
};

/**
 * Get message history between two users with pagination
 */
export const getMessageHistory = async (
  userId: string,
  partnerId: string,
  offset = 0,
  limit = DEFAULT_LIMIT
): Promise<{ success: boolean; data?: Message[]; error?: string }> => {
  try {
    // Get messages where either user is the sender and the other is the receiver
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(from_user.eq.${userId},to_user.eq.${partnerId}),and(from_user.eq.${partnerId},to_user.eq.${userId})`)
      .order('created_at', { ascending: false }) // Newest first
      .range(offset, offset + limit - 1);
    
    if (error) throw new Error(error.message);
    
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error getting message history:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get message history' 
    };
  }
};

/**
 * Mark a message as read
 */
export const markMessageAsRead = async (
  messageId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);
    
    if (error) throw new Error(error.message);
    
    return { success: true };
  } catch (error) {
    console.error('Error marking message as read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark message as read' 
    };
  }
};

/**
 * Mark all messages from a specific user as read
 */
export const markAllMessagesAsRead = async (
  fromUserId: string,
  toUserId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('from_user', fromUserId)
      .eq('to_user', toUserId)
      .is('read_at', null);
    
    if (error) throw new Error(error.message);
    
    return { success: true };
  } catch (error) {
    console.error('Error marking all messages as read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark messages as read' 
    };
  }
};

/**
 * Subscribe to new messages for a user
 */
export const subscribeToMessages = (
  userId: string,
  callback: (message: Message) => void
) => {
  // Subscribe to messages where the user is the recipient
  const subscription = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `to_user=eq.${userId}`,
      },
      (payload) => {
        // Call the callback with the new message
        callback(payload.new as Message);
      }
    )
    .subscribe();
  
  // Return the subscription for cleanup
  return subscription;
};

// Type for typing indicator
interface TypingIndicator {
  user_id: string;
  is_typing: boolean;
  updated_at: string;
}

/**
 * Set typing indicator status
 */
export const setTypingIndicator = async (
  userId: string,
  partnerId: string,
  isTyping: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First check if a record exists
    const { data: existingRecord } = await supabase
      .from('typing_indicators')
      .select('*')
      .eq('user_id', userId)
      .eq('partner_id', partnerId)
      .single();
    
    let error;
    
    if (existingRecord) {
      // Update existing record
      const result = await supabase
        .from('typing_indicators')
        .update({
          is_typing: isTyping,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('partner_id', partnerId);
      
      error = result.error;
    } else {
      // Insert new record
      const result = await supabase
        .from('typing_indicators')
        .insert({
          user_id: userId,
          partner_id: partnerId,
          is_typing: isTyping,
          updated_at: new Date().toISOString(),
        });
      
      error = result.error;
    }
    
    if (error) throw new Error(error.message);
    
    return { success: true };
  } catch (error) {
    console.error('Error setting typing indicator:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to set typing indicator' 
    };
  }
};

/**
 * Subscribe to typing indicators for a user
 */
export const subscribeToTypingIndicators = (
  userId: string,
  callback: (typingIndicator: TypingIndicator) => void
) => {
  // Subscribe to typing indicators where the user is the recipient
  const subscription = supabase
    .channel('typing_indicators')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'typing_indicators',
        filter: `partner_id=eq.${userId}`,
      },
      (payload) => {
        // Call the callback with the typing indicator
        callback(payload.new as TypingIndicator);
      }
    )
    .subscribe();
  
  // Return the subscription for cleanup
  return subscription;
};

/**
 * Get the offline message queue from local storage
 */
export const getOfflineMessageQueue = (): { 
  toUserId: string; 
  content: string; 
  createdAt: string;
}[] => {
  try {
    const queueString = localStorage.getItem('ottr_offline_message_queue');
    return queueString ? JSON.parse(queueString) : [];
  } catch (error) {
    console.error('Error getting offline message queue:', error);
    return [];
  }
};

/**
 * Add a message to the offline queue
 */
export const addToOfflineQueue = (
  toUserId: string,
  content: string
): void => {
  try {
    const queue = getOfflineMessageQueue();
    queue.push({
      toUserId,
      content,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('ottr_offline_message_queue', JSON.stringify(queue));
  } catch (error) {
    console.error('Error adding to offline message queue:', error);
  }
};

/**
 * Process the offline message queue
 */
export const processOfflineQueue = async (
  fromUserId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const queue = getOfflineMessageQueue();
    
    if (queue.length === 0) {
      return { success: true };
    }
    
    // Process each message in the queue
    for (const message of queue) {
      const { success } = await sendMessage(
        fromUserId,
        message.toUserId,
        message.content
      );
      
      if (!success) {
        // If any message fails, stop processing and keep the remaining messages in the queue
        const remainingQueue = queue.slice(queue.indexOf(message));
        localStorage.setItem('ottr_offline_message_queue', JSON.stringify(remainingQueue));
        return { success: false, error: 'Failed to process all offline messages' };
      }
    }
    
    // Clear the queue if all messages were sent successfully
    localStorage.removeItem('ottr_offline_message_queue');
    return { success: true };
  } catch (error) {
    console.error('Error processing offline message queue:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process offline message queue' 
    };
  }
};
