import supabase from '../supabase/supabaseClient';

export type NotificationType =
  | 'connection_request_received'
  | 'connection_request_accepted'
  | 'new_message'
  | 'connection_disconnected';

interface NotificationPayload {
  type: NotificationType;
  toUserId: string;
  data?: Record<string, any>;
}

/**
 * Calls Supabase Edge Function `send_notification`
 */
export async function sendPushNotification(payload: NotificationPayload) {
  try {
    await supabase.functions.invoke('send_notification', {
      body: payload,
    });
  } catch (error) {
    console.error('[NotificationApi] Failed to invoke function', error);
  }
}
