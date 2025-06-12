import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Safely trigger a light impact haptic feedback.
 * Uses Expo Haptics on native platforms and no-op on web.
 */
export const triggerLightImpact = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
};

/**
 * Trigger a success notification haptic.
 */
export const triggerSuccess = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }
};

/**
 * Trigger a warning notification haptic.
 */
export const triggerWarning = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }
};
