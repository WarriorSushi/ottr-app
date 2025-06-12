import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  notificationsEnabled: boolean;
  isLoading: boolean;
  toggleNotifications: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  notificationsEnabled: true,
  isLoading: true,

  loadSettings: async () => {
    try {
      const value = await AsyncStorage.getItem('notificationsEnabled');
      set({ notificationsEnabled: value !== 'false', isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleNotifications: async () => {
    const current = get().notificationsEnabled;
    const newVal = !current;
    set({ notificationsEnabled: newVal });
    await AsyncStorage.setItem('notificationsEnabled', newVal ? 'true' : 'false');
  },
}));

export default useSettingsStore;
