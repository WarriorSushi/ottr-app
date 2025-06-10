/**
 * App Navigator
 * 
 * Root navigator with authentication state handling.
 * Switches between AuthStack and MainStack based on user authentication status.
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, LinkingOptions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Linking } from 'react-native';
import { RootStackParamList } from './navigationTypes';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import theme from '../constants/theme';
import { supabase } from '../services/supabase/supabaseClient';
import { onAuthStateChange } from '../services/supabase/authService';

// Create the root stack navigator
const Stack = createStackNavigator<RootStackParamList>();

// Custom theme for React Navigation
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.textPrimary,
    border: '#E1E1E1', // Light border color
  },
};

/**
 * Linking configuration for deep links
 */
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['ottr://', 'https://ottr-messaging.app'],
  config: {
    screens: {
      Main: {
        path: 'main',
        screens: {
          Search: 'search',
          Chat: {
            path: 'chat/:userId/:username',
            parse: {
              userId: (userId: string) => userId,
              username: (username: string) => username,
            },
          },
          Settings: 'settings',
        },
      },
      Auth: {
        path: 'auth',
        screens: {
          Welcome: 'welcome',
          UsernameSetup: 'username-setup',
        },
      },
    },
  },
};

/**
 * AppNavigator Component
 */
const AppNavigator: React.FC = () => {
  // Track authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication state on mount
  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setIsLoading(false);
    };

    checkSession();

    // Subscribe to auth state changes
    const { data: authListener } = onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    // Cleanup subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Show loading state
  if (isLoading) {
    // In a real app, you would show a splash screen here
    return null;
  }

  return (
    <NavigationContainer theme={navigationTheme} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
