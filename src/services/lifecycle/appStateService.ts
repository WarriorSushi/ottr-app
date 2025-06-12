import { AppState, AppStateStatus } from 'react-native';
import { useRef } from 'react';
import { useMessageStore } from '../../store/messageStore';
import { useConnectionStore } from '../../store/connectionStore';
import { useAuthStore } from '../../store/authStore';

/**
 * Ottr AppStateService
 * Monitors app lifecycle changes and coordinates background/foreground actions.
 */
class AppStateService {
  private currentState: AppStateStatus = AppState.currentState;
  private listener?: () => void;

  /**
   * Start monitoring AppState changes. Should be called once on app mount.
   */
  start() {
    if (this.listener) return; // already started
    this.listener = AppState.addEventListener('change', this.handleChange).remove;
  }

  /**
   * Stop monitoring (optional cleanup)
   */
  stop() {
    if (this.listener) {
      this.listener();
      this.listener = undefined;
    }
  }

  /**
   * Handle app state change events
   */
  private handleChange = (nextState: AppStateStatus) => {
    if (this.currentState === nextState) return;

    const { cleanupSubscriptions, loadMessages, processOfflineQueue } = useMessageStore.getState();
    const { removeRealtimeSubscription, setupRealtimeSubscription, connectedUser } =
      useConnectionStore.getState();
    const { user } = useAuthStore.getState();

    if (nextState === 'background' || nextState === 'inactive') {
      // Pause realtime to save resources
      cleanupSubscriptions();
      removeRealtimeSubscription();
    } else if (nextState === 'active') {
      // Resume connections & sync
      if (user?.id) {
        setupRealtimeSubscription(user.id);
        processOfflineQueue();
        if (connectedUser?.id) {
          // Refresh messages from server
          loadMessages(user.id, connectedUser.id, true);
        }
      }
    }

    this.currentState = nextState;
  };
}

export default new AppStateService();
