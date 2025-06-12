import * as Notifications from 'expo-notifications';
import { SupabaseClient } from '@supabase/supabase-js';
import supabaseClient from '../supabase/supabaseClient';

/**
 * Ottr push token service – handles storing and validating Expo push tokens in Supabase.
 * Table column assumed: users.push_token (nullable text)
 */
export class OttrPushTokenService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient = supabaseClient) {
    this.client = client;
  }

  /**
   * Upsert user push token on users table
   */
  async updateUserPushToken(userId: string, token: string): Promise<void> {
    try {
      if (!userId || !token) return;

      await this.client.from('users').upsert({ id: userId, push_token: token }, { onConflict: 'id' });
    } catch (error) {
      console.error('[OttrPushTokenService] Failed to update push token', error);
    }
  }

  /**
   * Remove push token when user signs out or disables notifications
   */
  async removeUserPushToken(userId: string): Promise<void> {
    try {
      if (!userId) return;
      await this.client.from('users').update({ push_token: null }).eq('id', userId);
    } catch (error) {
      console.error('[OttrPushTokenService] Failed to remove push token', error);
    }
  }

  /**
   * Compare stored token with provided token, update if different
   */
  async validateTokenAndUpdate(userId: string, token: string): Promise<void> {
    if (!userId || !token) return;
    const { data, error } = await this.client.from('users').select('push_token').eq('id', userId).single();
    if (error) {
      console.error('[OttrPushTokenService] validate error', error);
      return;
    }
    if (data?.push_token !== token) {
      await this.updateUserPushToken(userId, token);
    }
  }
}
