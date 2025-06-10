/**
 * User Store
 * 
 * Zustand store for managing user state in the Ottr app.
 */

import { create } from 'zustand';
import { User } from '../types/database';
import * as userService from '../services/supabase/userService';

// User profile interface
export interface UserProfile extends User {}

// User store state interface
interface UserState {
  // State
  currentUser: UserProfile | null;
  searchResults: UserProfile[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateProfile: (userId: string, data: Partial<UserProfile>) => Promise<boolean>;
  searchUsers: (username: string) => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  getUserConnectionStatus: (userId: string) => Promise<{
    status: string | null;
    connectedTo: string | null;
  }>;
  setCurrentUser: (user: UserProfile | null) => void;
  clearSearchResults: () => void;
  clearError: () => void;
}

/**
 * User store for managing user state
 */
export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  currentUser: null,
  searchResults: [],
  isLoading: false,
  error: null,
  
  // Update user profile
  updateProfile: async (userId: string, data: Partial<UserProfile>) => {
    try {
      set({ isLoading: true, error: null });
      
      const result = await userService.updateUserProfile(userId, data);
      
      if (!result.success) {
        set({ error: result.error || 'Failed to update profile', isLoading: false });
        return false;
      }
      
      // Update current user in store if it's the same user
      const { currentUser } = get();
      if (currentUser && currentUser.id === userId) {
        set({ 
          currentUser: { ...currentUser, ...data },
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
      
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      });
      return false;
    }
  },
  
  // Search users by username
  searchUsers: async (username: string) => {
    try {
      if (!username || username.trim() === '') {
        set({ searchResults: [], isLoading: false });
        return;
      }
      
      set({ isLoading: true, error: null });
      
      const result = await userService.getUserByUsername(username);
      
      if (result.error) {
        set({ error: result.error, isLoading: false });
        return;
      }
      
      set({ 
        searchResults: result.data || [],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      });
    }
  },
  
  // Check if a username is available
  checkUsernameAvailability: async (username: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const result = await userService.checkUsernameAvailability(username);
      
      set({ isLoading: false });
      
      if (result.error) {
        set({ error: result.error });
        return false;
      }
      
      return result.available;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      });
      return false;
    }
  },
  
  // Get user connection status
  getUserConnectionStatus: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const result = await userService.getUserConnectionStatus(userId);
      
      set({ isLoading: false });
      
      if (result.error) {
        set({ error: result.error });
        return { status: null, connectedTo: null };
      }
      
      return { 
        status: result.status, 
        connectedTo: result.connectedTo 
      };
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      });
      return { status: null, connectedTo: null };
    }
  },
  
  // Set current user
  setCurrentUser: (user: UserProfile | null) => {
    set({ currentUser: user });
  },
  
  // Clear search results
  clearSearchResults: () => {
    set({ searchResults: [] });
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useUserStore;
