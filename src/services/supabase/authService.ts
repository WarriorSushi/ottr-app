/**
 * Ottr Authentication Service
 * 
 * Handles authentication operations for the Ottr app using Supabase Auth
 * with Google OAuth via Expo AuthSession.
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { OAUTH_CONFIG } from '../../constants/config';
import supabase from './supabaseClient';

// Register the WebBrowser for handling OAuth redirects
WebBrowser.maybeCompleteAuthSession();

// URL for redirecting after authentication
const redirectTo = AuthSession.makeRedirectUri({ 
  path: 'auth/callback' 
});

/**
 * Sign in with Google using Expo AuthSession
 * @returns Promise with the authentication result
 */
export const googleSignIn = async () => {
  try {
    // Get the discovery document for Google OAuth
    const discovery = await AuthSession.fetchDiscoveryAsync('https://accounts.google.com');
    
    // Create the auth request
    const request = new AuthSession.AuthRequest({
      clientId: Platform.OS === 'android' 
        ? OAUTH_CONFIG.GOOGLE_ANDROID_CLIENT_ID 
        : OAUTH_CONFIG.GOOGLE_WEB_CLIENT_ID,
      redirectUri: redirectTo,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Token,
      extraParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    });

    // Start the auth flow
    const response = await request.promptAsync(discovery);

    if (response.type === 'success') {
      const { id_token } = response.params;
      
      // Sign in to Supabase with the Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: id_token,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data };
    } else {
      return { success: false, error: 'Authentication was cancelled or failed' };
    }
  } catch (error) {
    console.error('Google sign in error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

/**
 * Sign out the current user
 * @returns Promise with the sign out result
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

/**
 * Get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return session?.user || null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Set up an auth state change listener
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

export default {
  googleSignIn,
  signOut,
  getCurrentUser,
  onAuthStateChange,
};
