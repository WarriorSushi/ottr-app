/**
 * Navigation Types
 * 
 * TypeScript type definitions for React Navigation.
 */

import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack Parameter List
export type AuthStackParamList = {
  Welcome: undefined;
  UsernameSetup: undefined;
};

// Main Stack Parameter List
export type MainStackParamList = {
  Search: undefined;
  Chat: {
    userId: string;
    username: string;
  };
  Settings: undefined;
};

// Root Navigator Parameter List
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Navigation Types for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
