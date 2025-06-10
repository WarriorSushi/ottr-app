/**
 * Message Store
 * 
 * Zustand store for managing message state:
 * - Messages array with pagination
 * - Send message functionality
 * - Real-time message updates
 * - Typing indicator state
 * - Read receipt management
 */

import { create } from 'zustand';
import { RealtimeChannel } from '@supabase/supabase-js';
import * as messageService from '../services/supabase/messageService';
import { Message } from '../types/database';
import { supabase } from '../services/supabase/supabaseClient';
import { useAuthStore } from './authStore';
import { useConnectionStore } from './connectionStore';
import NetInfo from '@react-native-community/netinfo';

// Type for typing indicators
interface TypingIndicator {
  userId: string;
  isTyping: boolean;
  updatedAt: string;
}

// Interface for the message store state
interface MessageState {
  // Message data
  messages: Message[];
  hasMoreMessages: boolean;
  isLoadingMessages: boolean;
  isLoadingMore: boolean;
  isSendingMessage: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  messagesPerPage: number;
  
  // Typing indicator
  partnerIsTyping: boolean;
  isTyping: boolean;
  typingTimeout: NodeJS.Timeout | null;
  
  // Subscriptions
  messageSubscription: RealtimeChannel | null;
  typingSubscription: RealtimeChannel | null;
  
  // Network status
  isOnline: boolean;
  
  // Actions
  initializeStore: (userId: string, partnerId: string) => Promise<void>;
  loadMessages: (userId: string, partnerId: string, refresh?: boolean) => Promise<void>;
  loadMoreMessages: (userId: string, partnerId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  markAllAsRead: (fromUserId: string) => Promise<void>;
  setTypingStatus: (isTyping: boolean) => Promise<void>;
  cleanupSubscriptions: () => void;
  processOfflineQueue: () => Promise<void>;
  resetStore: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  // Message data
  messages: [],
  hasMoreMessages: true,
  isLoadingMessages: false,
  isLoadingMore: false,
  isSendingMessage: false,
  error: null,
  
  // Pagination
  currentPage: 0,
  messagesPerPage: 20,
  
  // Typing indicator
  partnerIsTyping: false,
  isTyping: false,
  typingTimeout: null,
  
  // Subscriptions
  messageSubscription: null,
  typingSubscription: null,
  
  // Network status
  isOnline: true,
  
  /**
   * Initialize the message store
   */
  initializeStore: async (userId: string, partnerId: string) => {
    // Clean up any existing subscriptions
    get().cleanupSubscriptions();
    
    // Set up network status listener
    NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      
      // If we're coming back online, process the offline queue
      if (isConnected && !get().isOnline) {
        get().processOfflineQueue();
      }
      
      set({ isOnline: isConnected });
    });
    
    // Subscribe to new messages
    const messageSubscription = messageService.subscribeToMessages(
      userId,
      (newMessage: Message) => {
        // Add the new message to the state
        set(state => ({
          messages: [newMessage, ...state.messages],
        }));
        
        // If the message is from the partner, mark it as read
        if (newMessage.from_user === partnerId) {
          get().markAsRead(newMessage.id);
        }
      }
    );
    
    // Subscribe to typing indicators
    const typingSubscription = messageService.subscribeToTypingIndicators(
      userId,
      (indicator) => {
        // Only update if the indicator is from the partner
        if (indicator.user_id === partnerId) {
          set({ partnerIsTyping: indicator.is_typing });
        }
      }
    );
    
    // Set the subscriptions in state
    set({
      messageSubscription,
      typingSubscription,
    });
    
    // Load initial messages
    await get().loadMessages(userId, partnerId);
    
    // Process any offline messages
    await get().processOfflineQueue();
  },
  
  /**
   * Load messages between two users
   */
  loadMessages: async (userId: string, partnerId: string, refresh = false) => {
    set({ isLoadingMessages: true, error: null });
    
    try {
      const page = refresh ? 0 : get().currentPage;
      const offset = page * get().messagesPerPage;
      
      const { success, data, error } = await messageService.getMessageHistory(
        userId,
        partnerId,
        offset,
        get().messagesPerPage
      );
      
      if (!success || !data) {
        throw new Error(error || 'Failed to load messages');
      }
      
      // If refreshing, replace messages, otherwise append them
      set(state => ({
        messages: refresh ? data : [...state.messages, ...data],
        hasMoreMessages: data.length === get().messagesPerPage,
        currentPage: refresh ? 0 : state.currentPage,
        isLoadingMessages: false,
      }));
      
      // Mark all unread messages from partner as read
      const unreadMessages = data.filter(
        msg => msg.from_user === partnerId && msg.read_at === null
      );
      
      if (unreadMessages.length > 0) {
        get().markAllAsRead(partnerId);
      }
    } catch (error) {
      set({
        isLoadingMessages: false,
        error: error instanceof Error ? error.message : 'Failed to load messages',
      });
    }
  },
  
  /**
   * Load more messages (pagination)
   */
  loadMoreMessages: async (userId: string, partnerId: string) => {
    // Don't load more if we're already loading or there are no more messages
    if (get().isLoadingMore || !get().hasMoreMessages) return;
    
    set({ isLoadingMore: true });
    
    try {
      const nextPage = get().currentPage + 1;
      const offset = nextPage * get().messagesPerPage;
      
      const { success, data, error } = await messageService.getMessageHistory(
        userId,
        partnerId,
        offset,
        get().messagesPerPage
      );
      
      if (!success || !data) {
        throw new Error(error || 'Failed to load more messages');
      }
      
      set(state => ({
        messages: [...state.messages, ...data],
        hasMoreMessages: data.length === get().messagesPerPage,
        currentPage: nextPage,
        isLoadingMore: false,
      }));
    } catch (error) {
      set({
        isLoadingMore: false,
        error: error instanceof Error ? error.message : 'Failed to load more messages',
      });
    }
  },
  
  /**
   * Send a message
   */
  sendMessage: async (content: string) => {
    set({ isSendingMessage: true, error: null });
    
    try {
      const user = useAuthStore.getState().user;
      const connectedUser = useConnectionStore.getState().connectedUser;
      
      if (!user?.id || !connectedUser?.id) {
        throw new Error('User or connected user not found');
      }
      
      // Clear typing indicator when sending a message
      await get().setTypingStatus(false);
      
      // Check if we're online
      if (!get().isOnline) {
        // Add to offline queue
        messageService.addToOfflineQueue(connectedUser.id, content);
        
        // Add optimistic message to state
        const optimisticMessage: Message = {
          id: `offline-${Date.now()}`,
          content,
          from_user: user.id,
          to_user: connectedUser.id,
          created_at: new Date().toISOString(),
          read_at: null,
        };
        
        set(state => ({
          messages: [optimisticMessage, ...state.messages],
          isSendingMessage: false,
        }));
        
        return;
      }
      
      // Send the message
      const { success, data, error } = await messageService.sendMessage(
        user.id,
        connectedUser.id,
        content
      );
      
      if (!success || !data) {
        throw new Error(error || 'Failed to send message');
      }
      
      // Add the new message to the state
      set(state => ({
        messages: [data, ...state.messages],
        isSendingMessage: false,
      }));
    } catch (error) {
      set({
        isSendingMessage: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  },
  
  /**
   * Mark a message as read
   */
  markAsRead: async (messageId: string) => {
    try {
      await messageService.markMessageAsRead(messageId);
      
      // Update the message in state
      set(state => ({
        messages: state.messages.map(msg =>
          msg.id === messageId
            ? { ...msg, read_at: new Date().toISOString() }
            : msg
        ),
      }));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  },
  
  /**
   * Mark all messages from a user as read
   */
  markAllAsRead: async (fromUserId: string) => {
    try {
      const user = useAuthStore.getState().user;
      
      if (!user?.id) {
        throw new Error('User not found');
      }
      
      await messageService.markAllMessagesAsRead(fromUserId, user.id);
      
      // Update all messages from this user in state
      set(state => ({
        messages: state.messages.map(msg =>
          msg.from_user === fromUserId && msg.read_at === null
            ? { ...msg, read_at: new Date().toISOString() }
            : msg
        ),
      }));
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  },
  
  /**
   * Set typing status
   */
  setTypingStatus: async (isTyping: boolean) => {
    try {
      const user = useAuthStore.getState().user;
      const connectedUser = useConnectionStore.getState().connectedUser;
      
      if (!user?.id || !connectedUser?.id || !get().isOnline) {
        return;
      }
      
      // Clear any existing timeout
      if (get().typingTimeout) {
        clearTimeout(get().typingTimeout);
      }
      
      // Set typing status in state
      set({ isTyping });
      
      // If typing, set a timeout to clear it after 5 seconds
      let typingTimeout: NodeJS.Timeout | null = null;
      
      if (isTyping) {
        typingTimeout = setTimeout(() => {
          get().setTypingStatus(false);
        }, 5000);
      }
      
      set({ typingTimeout });
      
      // Update typing indicator in database
      await messageService.setTypingIndicator(
        user.id,
        connectedUser.id,
        isTyping
      );
    } catch (error) {
      console.error('Error setting typing status:', error);
    }
  },
  
  /**
   * Clean up subscriptions
   */
  cleanupSubscriptions: () => {
    const { messageSubscription, typingSubscription, typingTimeout } = get();
    
    if (messageSubscription) {
      supabase.removeChannel(messageSubscription);
    }
    
    if (typingSubscription) {
      supabase.removeChannel(typingSubscription);
    }
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    set({
      messageSubscription: null,
      typingSubscription: null,
      typingTimeout: null,
    });
  },
  
  /**
   * Process offline message queue
   */
  processOfflineQueue: async () => {
    try {
      const user = useAuthStore.getState().user;
      
      if (!user?.id) {
        return;
      }
      
      await messageService.processOfflineQueue(user.id);
    } catch (error) {
      console.error('Error processing offline queue:', error);
    }
  },
  
  /**
   * Reset the store
   */
  resetStore: () => {
    // Clean up subscriptions
    get().cleanupSubscriptions();
    
    // Reset state
    set({
      messages: [],
      hasMoreMessages: true,
      isLoadingMessages: false,
      isLoadingMore: false,
      isSendingMessage: false,
      error: null,
      currentPage: 0,
      partnerIsTyping: false,
      isTyping: false,
    });
  },
}));
