/**
 * Connection Store
 * 
 * Zustand store for managing connection state in the Ottr app.
 * Handles connection requests, status, and real-time updates.
 */

import { create } from 'zustand';
import { User, ConnectionRequest } from '../types/database';
import * as connectionService from '../services/supabase/connectionService';
import supabase from '../services/supabase/supabaseClient';
import { CONNECTION_STATES } from '../constants/config';

// Connection store state interface
interface ConnectionState {
  // State
  connectionStatus: string | null;
  connectedUser: User | null;
  pendingRequests: ConnectionRequest[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  sendRequest: (toUserId: string) => Promise<boolean>;
  acceptRequest: (requestId: string) => Promise<boolean>;
  rejectRequest: (requestId: string) => Promise<boolean>;
  disconnect: (userId: string) => Promise<boolean>;
  getConnectionRequests: (userId: string) => Promise<void>;
  getConnectedUser: (userId: string) => Promise<void>;
  setupRealtimeSubscription: (userId: string) => void;
  removeRealtimeSubscription: () => void;
  clearError: () => void;
}

/**
 * Connection store for managing connection state
 */
export const useConnectionStore = create<ConnectionState>((set, get) => ({
  // Initial state
  connectionStatus: null,
  connectedUser: null,
  pendingRequests: [],
  isLoading: false,
  error: null,
  
  // Send connection request
  sendRequest: async (toUserId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { success, error } = await connectionService.sendConnectionRequest(
        get().connectedUser?.id || '',
        toUserId
      );
      
      set({ isLoading: false });
      
      if (!success) {
        set({ error: error || 'Failed to send connection request' });
        return false;
      }
      
      set({ connectionStatus: CONNECTION_STATES.PENDING });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      return false;
    }
  },
  
  // Accept connection request
  acceptRequest: async (requestId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { success, error } = await connectionService.acceptConnectionRequest(requestId);
      
      set({ isLoading: false });
      
      if (!success) {
        set({ error: error || 'Failed to accept connection request' });
        return false;
      }
      
      // Update local state
      // The real-time subscription will handle updating the connection status and user
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      return false;
    }
  },
  
  // Reject connection request
  rejectRequest: async (requestId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { success, error } = await connectionService.rejectConnectionRequest(requestId);
      
      set({ isLoading: false });
      
      if (!success) {
        set({ error: error || 'Failed to reject connection request' });
        return false;
      }
      
      // Update local state
      // The real-time subscription will handle updating the connection status
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      return false;
    }
  },
  
  // Disconnect from connected user
  disconnect: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { success, error } = await connectionService.disconnectUsers(userId);
      
      set({ isLoading: false });
      
      if (!success) {
        set({ error: error || 'Failed to disconnect' });
        return false;
      }
      
      // Update local state
      set({
        connectionStatus: CONNECTION_STATES.DISCONNECTED,
        connectedUser: null,
      });
      
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      return false;
    }
  },
  
  // Get connection requests for a user
  getConnectionRequests: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await connectionService.getConnectionRequests(userId);
      
      if (error) {
        set({ error, isLoading: false });
        return;
      }
      
      set({
        pendingRequests: data || [],
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  },
  
  // Get connected user for a user
  getConnectedUser: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // First get the user's connection status
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('connection_status')
        .eq('id', userId)
        .single();
      
      if (userError) {
        set({ error: userError.message, isLoading: false });
        return;
      }
      
      set({ connectionStatus: userData.connection_status });
      
      // If connected, get the connected user
      if (userData.connection_status === CONNECTION_STATES.CONNECTED) {
        const { data, error } = await connectionService.getConnectedUser(userId);
        
        if (error) {
          set({ error, isLoading: false });
          return;
        }
        
        set({ connectedUser: data, isLoading: false });
      } else {
        set({ connectedUser: null, isLoading: false });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  },
  
  // Setup real-time subscription for connection changes
  setupRealtimeSubscription: (userId: string) => {
    // Subscribe to changes in the users table for this user
    const userSubscription = supabase
      .channel('connection-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        async (payload) => {
          const updatedUser = payload.new as User;
          
          // Update connection status
          set({ connectionStatus: updatedUser.connection_status });
          
          // If connected, get the connected user
          if (updatedUser.connection_status === CONNECTION_STATES.CONNECTED && updatedUser.connected_to) {
            const { data } = await connectionService.getConnectedUser(userId);
            set({ connectedUser: data });
          } else {
            set({ connectedUser: null });
          }
        }
      )
      .subscribe();
      
    // Subscribe to changes in connection requests table for this user
    const requestsSubscription = supabase
      .channel('connection-requests')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'connection_requests',
          filter: `or(from_user=eq.${userId},to_user=eq.${userId})`,
        },
        async () => {
          // Refresh the connection requests
          const { getConnectionRequests } = get();
          await getConnectionRequests(userId);
        }
      )
      .subscribe();
  },
  
  // Remove real-time subscription
  removeRealtimeSubscription: () => {
    supabase.channel('connection-changes').unsubscribe();
    supabase.channel('connection-requests').unsubscribe();
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useConnectionStore;
