/**
 * Supabase Client
 * 
 * Initializes and exports the Supabase client for the Ottr app.
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { API_CONFIG } from '../../constants/config';
import { Database } from '../../types/database';

// Initialize the Supabase client with the project URL and anon key
const supabaseUrl = API_CONFIG.SUPABASE_URL;
const supabaseAnonKey = API_CONFIG.SUPABASE_ANON_KEY;

// Create the Supabase client with AsyncStorage for persistence
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export default supabase;
