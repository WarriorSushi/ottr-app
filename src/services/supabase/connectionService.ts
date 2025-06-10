/**
 * Connection Service
 * 
 * Handles connection-related operations for the Ottr exclusive messaging app.
 * Implements the core connection system with Supabase.
 */

import supabase from './supabaseClient';
import { CONNECTION_STATES, REQUEST_STATES } from '../../constants/config';
import { User, ConnectionRequest } from '../../types/database';

/**
 * Send a connection request from one user to another
 * @param fromUserId ID of the user sending the request
 * @param toUserId ID of the user receiving the request
 * @returns Success status and error if any
 */
export const sendConnectionRequest = async (
  fromUserId: string,
  toUserId: string
): Promise<{
  success: boolean;
  error: string | null;
}> => {
  try {
    // Start a transaction
    const { error: transactionError } = await supabase.rpc('begin_transaction');
    if (transactionError) throw new Error(transactionError.message);

    // 1. Validate both users are disconnected
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, connection_status')
      .in('id', [fromUserId, toUserId]);

    if (usersError) throw new Error(usersError.message);
    
    if (!users || users.length !== 2) {
      throw new Error('One or both users not found');
    }

    const fromUser = users.find(user => user.id === fromUserId);
    const toUser = users.find(user => user.id === toUserId);

    if (!fromUser || !toUser) {
      throw new Error('One or both users not found');
    }

    if (fromUser.connection_status !== CONNECTION_STATES.DISCONNECTED) {
      throw new Error('You must be disconnected to send a connection request');
    }

    if (toUser.connection_status !== CONNECTION_STATES.DISCONNECTED) {
      throw new Error('You can only connect with disconnected users');
    }

    // 2. Check if a request already exists between these users
    const { data: existingRequests, error: requestsError } = await supabase
      .from('connection_requests')
      .select('*')
      .or(`from_user.eq.${fromUserId},from_user.eq.${toUserId}`)
      .or(`to_user.eq.${toUserId},to_user.eq.${fromUserId}`)
      .eq('status', REQUEST_STATES.PENDING);

    if (requestsError) throw new Error(requestsError.message);

    if (existingRequests && existingRequests.length > 0) {
      throw new Error('A connection request already exists between these users');
    }

    // 3. Create the connection request
    const { error: insertError } = await supabase
      .from('connection_requests')
      .insert({
        from_user: fromUserId,
        to_user: toUserId,
        status: REQUEST_STATES.PENDING,
      });

    if (insertError) throw new Error(insertError.message);

    // 4. Update both users' connection status to pending
    const { error: updateFromUserError } = await supabase
      .from('users')
      .update({ connection_status: CONNECTION_STATES.PENDING })
      .eq('id', fromUserId);

    if (updateFromUserError) throw new Error(updateFromUserError.message);

    const { error: updateToUserError } = await supabase
      .from('users')
      .update({ connection_status: CONNECTION_STATES.PENDING })
      .eq('id', toUserId);

    if (updateToUserError) throw new Error(updateToUserError.message);

    // Commit transaction
    const { error: commitError } = await supabase.rpc('commit_transaction');
    if (commitError) throw new Error(commitError.message);

    return { success: true, error: null };
  } catch (error) {
    // Rollback transaction on error
    await supabase.rpc('rollback_transaction');
    
    console.error('Send connection request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};

/**
 * Accept a connection request
 * @param requestId ID of the connection request to accept
 * @returns Success status and error if any
 */
export const acceptConnectionRequest = async (
  requestId: string
): Promise<{
  success: boolean;
  error: string | null;
}> => {
  try {
    // Start a transaction
    const { error: transactionError } = await supabase.rpc('begin_transaction');
    if (transactionError) throw new Error(transactionError.message);

    // 1. Get the request details
    const { data: request, error: requestError } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', REQUEST_STATES.PENDING)
      .single();

    if (requestError) throw new Error(requestError.message);
    if (!request) throw new Error('Connection request not found or already processed');

    // 2. Update the request status
    const { error: updateRequestError } = await supabase
      .from('connection_requests')
      .update({ status: REQUEST_STATES.ACCEPTED })
      .eq('id', requestId);

    if (updateRequestError) throw new Error(updateRequestError.message);

    // 3. Update both users to connected status and set connected_to
    const { error: updateFromUserError } = await supabase
      .from('users')
      .update({
        connection_status: CONNECTION_STATES.CONNECTED,
        connected_to: request.to_user,
      })
      .eq('id', request.from_user);

    if (updateFromUserError) throw new Error(updateFromUserError.message);

    const { error: updateToUserError } = await supabase
      .from('users')
      .update({
        connection_status: CONNECTION_STATES.CONNECTED,
        connected_to: request.from_user,
      })
      .eq('id', request.to_user);

    if (updateToUserError) throw new Error(updateToUserError.message);

    // Commit transaction
    const { error: commitError } = await supabase.rpc('commit_transaction');
    if (commitError) throw new Error(commitError.message);

    return { success: true, error: null };
  } catch (error) {
    // Rollback transaction on error
    await supabase.rpc('rollback_transaction');
    
    console.error('Accept connection request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};

/**
 * Reject a connection request
 * @param requestId ID of the connection request to reject
 * @returns Success status and error if any
 */
export const rejectConnectionRequest = async (
  requestId: string
): Promise<{
  success: boolean;
  error: string | null;
}> => {
  try {
    // Start a transaction
    const { error: transactionError } = await supabase.rpc('begin_transaction');
    if (transactionError) throw new Error(transactionError.message);

    // 1. Get the request details
    const { data: request, error: requestError } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', REQUEST_STATES.PENDING)
      .single();

    if (requestError) throw new Error(requestError.message);
    if (!request) throw new Error('Connection request not found or already processed');

    // 2. Update the request status
    const { error: updateRequestError } = await supabase
      .from('connection_requests')
      .update({ status: REQUEST_STATES.REJECTED })
      .eq('id', requestId);

    if (updateRequestError) throw new Error(updateRequestError.message);

    // 3. Update both users back to disconnected status
    const { error: updateFromUserError } = await supabase
      .from('users')
      .update({
        connection_status: CONNECTION_STATES.DISCONNECTED,
        connected_to: null,
      })
      .eq('id', request.from_user);

    if (updateFromUserError) throw new Error(updateFromUserError.message);

    const { error: updateToUserError } = await supabase
      .from('users')
      .update({
        connection_status: CONNECTION_STATES.DISCONNECTED,
        connected_to: null,
      })
      .eq('id', request.to_user);

    if (updateToUserError) throw new Error(updateToUserError.message);

    // Commit transaction
    const { error: commitError } = await supabase.rpc('commit_transaction');
    if (commitError) throw new Error(commitError.message);

    return { success: true, error: null };
  } catch (error) {
    // Rollback transaction on error
    await supabase.rpc('rollback_transaction');
    
    console.error('Reject connection request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};

/**
 * Disconnect users from each other
 * @param userId ID of one of the users to disconnect
 * @returns Success status and error if any
 */
export const disconnectUsers = async (
  userId: string
): Promise<{
  success: boolean;
  error: string | null;
}> => {
  try {
    // Start a transaction
    const { error: transactionError } = await supabase.rpc('begin_transaction');
    if (transactionError) throw new Error(transactionError.message);

    // 1. Get the user and their connected partner
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, connected_to')
      .eq('id', userId)
      .eq('connection_status', CONNECTION_STATES.CONNECTED)
      .single();

    if (userError) throw new Error(userError.message);
    if (!user || !user.connected_to) throw new Error('User is not connected to anyone');

    const connectedUserId = user.connected_to;

    // 2. Update both users to disconnected status
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        connection_status: CONNECTION_STATES.DISCONNECTED,
        connected_to: null,
      })
      .eq('id', userId);

    if (updateUserError) throw new Error(updateUserError.message);

    const { error: updateConnectedUserError } = await supabase
      .from('users')
      .update({
        connection_status: CONNECTION_STATES.DISCONNECTED,
        connected_to: null,
      })
      .eq('id', connectedUserId);

    if (updateConnectedUserError) throw new Error(updateConnectedUserError.message);

    // Commit transaction
    const { error: commitError } = await supabase.rpc('commit_transaction');
    if (commitError) throw new Error(commitError.message);

    return { success: true, error: null };
  } catch (error) {
    // Rollback transaction on error
    await supabase.rpc('rollback_transaction');
    
    console.error('Disconnect users error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};

/**
 * Get connection requests for a user
 * @param userId User ID to get requests for
 * @returns List of connection requests and error if any
 */
export const getConnectionRequests = async (
  userId: string
): Promise<{
  data: ConnectionRequest[] | null;
  error: string | null;
}> => {
  try {
    // Get requests where the user is either the sender or receiver
    const { data, error } = await supabase
      .from('connection_requests')
      .select(`
        *,
        from_user_details:users!connection_requests_from_user_fkey(id, username, display_name),
        to_user_details:users!connection_requests_to_user_fkey(id, username, display_name)
      `)
      .or(`from_user.eq.${userId},to_user.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return { data, error: null };
  } catch (error) {
    console.error('Get connection requests error:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};

/**
 * Get the connected user for a given user
 * @param userId User ID to get connected user for
 * @returns Connected user details and error if any
 */
export const getConnectedUser = async (
  userId: string
): Promise<{
  data: User | null;
  error: string | null;
}> => {
  try {
    // First get the user to find their connected_to ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('connected_to')
      .eq('id', userId)
      .eq('connection_status', CONNECTION_STATES.CONNECTED)
      .single();

    if (userError) throw new Error(userError.message);
    if (!user || !user.connected_to) return { data: null, error: null };

    // Then get the connected user's details
    const { data: connectedUser, error: connectedUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.connected_to)
      .single();

    if (connectedUserError) throw new Error(connectedUserError.message);

    return { data: connectedUser, error: null };
  } catch (error) {
    console.error('Get connected user error:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};

export default {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  disconnectUsers,
  getConnectionRequests,
  getConnectedUser,
};
