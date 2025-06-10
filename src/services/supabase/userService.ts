/**
 * Ottr User Service
 * 
 * Handles user-related operations for the Ottr app using Supabase.
 */

import supabase from './supabaseClient';
import { User, ConnectionStatus } from '../../types/database';

/**
 * Search for users by username
 * @param username Username to search for (can be partial)
 * @returns Array of matching users
 */
export const getUserByUsername = async (username: string): Promise<{
  data: User[] | null;
  error: string | null;
}> => {
  try {
    // Format username for search (remove @ if present)
    const searchTerm = username.startsWith('@') ? username : `@${username}`;
    
    // Search for users with username containing the search term
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', `%${searchTerm}%`)
      .limit(10);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Get user by username error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

/**
 * Update user profile data
 * @param userId User ID to update
 * @param data User data to update
 * @returns Success status and error if any
 */
export const updateUserProfile = async (
  userId: string, 
  data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
): Promise<{
  success: boolean;
  error: string | null;
}> => {
  try {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Update user profile error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

/**
 * Check if a username is available
 * @param username Username to check
 * @returns Whether the username is available
 */
export const checkUsernameAvailability = async (username: string): Promise<{
  available: boolean;
  error: string | null;
}> => {
  try {
    // Format username to ensure it starts with @
    const formattedUsername = username.startsWith('@') ? username : `@${username}`;
    
    // Check if username exists
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', formattedUsername)
      .maybeSingle();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Username is available if no matching record was found
    return { available: !data, error: null };
  } catch (error) {
    console.error('Check username availability error:', error);
    return { 
      available: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

/**
 * Get user's current connection status
 * @param userId User ID to check
 * @returns Connection status and connected user ID if any
 */
export const getUserConnectionStatus = async (userId: string): Promise<{
  status: ConnectionStatus | null;
  connectedTo: string | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('connection_status, connected_to')
      .eq('id', userId)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { 
      status: data.connection_status, 
      connectedTo: data.connected_to,
      error: null 
    };
  } catch (error) {
    console.error('Get user connection status error:', error);
    return { 
      status: null, 
      connectedTo: null,
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

export default {
  getUserByUsername,
  updateUserProfile,
  checkUsernameAvailability,
  getUserConnectionStatus,
};
