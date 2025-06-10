/**
 * Auth Store
 * 
 * Zustand store for managing authentication state in the Ottr app.
 */

import { create } from 'zustand';
import { supabase } from '../services/supabase/supabaseClient';
import * as authService from '../services/supabase/authService';
import { User } from '@supabase/supabase-js';

// Auth store state interface
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  setupProfile: (username: string, displayName: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Auth store for managing authentication state
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  // Sign in with Google
  signIn: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const result = await authService.googleSignIn();
      
      if (!result.success) {
        set({ error: result.error || 'Sign in failed', isLoading: false });
        return;
      }
      
      // Get user from session
      const user = await authService.getCurrentUser();
      set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      });
    }
  },
  
  // Sign out
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const result = await authService.signOut();
      
      if (!result.success) {
        set({ error: result.error || 'Sign out failed', isLoading: false });
        return;
      }
      
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      });
    }
  },
  
  // Setup user profile with username and display name
  setupProfile: async (username: string, displayName: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { user } = get();
      
      if (!user) {
        set({ error: 'User not authenticated', isLoading: false });
        return false;
      }
      
      // Format username to ensure it starts with @
      const formattedUsername = username.startsWith('@') ? username : `@${username}`;
      
      // Insert user profile into users table
      const { error } = await supabase.from('users').insert({
        id: user.id,
        username: formattedUsername,
        email: user.email || '',
        display_name: displayName,
        connection_status: 'disconnected',
      });
      
      if (error) {
        // Check if error is due to unique constraint violation (username already taken)
        if (error.code === '23505') {
          set({ error: 'Username already taken', isLoading: false });
        } else {
          set({ error: error.message, isLoading: false });
        }
        return false;
      }
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      });
      return false;
    }
  },
  
  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
