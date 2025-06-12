import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';
import { OttrPushTokenService } from './pushTokenService';
import { getCurrentUser } from '../supabase/authService';
import { MainStackParamList } from '../../navigation/navigationTypes';
import * as Linking from 'expo-linking';
import { useSettingsStore } from '../../store/settingsStore';

/**
 * Ottr Notification Service
 * Handles permission requests, push token registration, foreground handling, and tap navigation.
 */
class NotificationService {
  private pushService = new OttrPushTokenService();

  /**
   * Request permissions from user (iOS and Android 13+)
   */
  async requestPermissions(): Promise<boolean> {
    const settings = await Notifications.getPermissionsAsync();
    let granted = settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    if (!granted) {
      const { status } = await Notifications.requestPermissionsAsync();
      granted = status === 'granted' || status === 'provisional';
    }
    return granted;
  }

  /**
   * Configure Android notification channels and iOS handler
   */
  async configureChannels() {
    if (Platform.OS === 'android') {
      // Default channel for generic notifications
      await Notifications.setNotificationChannelAsync('default', {
        name: 'General',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFBE98',
      });

      // Message channel with higher importance and custom sound
      await Notifications.setNotificationChannelAsync('message', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'message.wav', // place message.wav under android/app/src/main/res/raw/
        vibrationPattern: [0, 400, 250, 400],
        lightColor: '#FF8A80',
      });
    } else if (Platform.OS === 'ios') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    }
  }

  /**
   * Register device for push notifications and store token in Supabase
   */
  async registerPushToken(): Promise<void> {
    // Ensure channels/handler configured
    await this.configureChannels();

    const hasPerm = await this.requestPermissions();
    if (!hasPerm) return;

    // Respect user preference
    const { notificationsEnabled } = useSettingsStore.getState();
    if (!notificationsEnabled) return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    const currentUser = await getCurrentUser();
    if (currentUser?.id) {
      await this.pushService.validateTokenAndUpdate(currentUser.id, token);
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFBE98',
      });
    }
  }

  /**
   * Listen for notifications in foreground
   */
  handleNotificationReceived(listener: (notification: any) => void) {
    // Using any due to stubbed expo-notifications types
    return Notifications.addNotificationReceivedListener(listener as any);
  }

  /**
   * Handle notification press/tap for navigation
   */
  handleNotificationPressed(navigationRef: NavigationContainerRef<MainStackParamList>) {
    return Notifications.addNotificationResponseReceivedListener((response: any) => {
      const { data } = response.notification.request.content;
      const deepLink = data?.deepLink as string | undefined;
      if (deepLink) {
        const url = Linking.parse(deepLink);
        if (url.path?.startsWith('chat/')) {
          const segments = url.path.split('/');
          const [, userId, username] = segments; // segments[0] = 'chat'
          if (userId && username) {
            navigationRef.navigate('Chat', { userId, username });
          }
        }
      }
    });
  }
}

export default new NotificationService();
