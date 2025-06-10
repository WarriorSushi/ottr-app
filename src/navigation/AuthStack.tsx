/**
 * Auth Stack Navigator
 * 
 * Navigation stack for authentication flow: Welcome → UsernameSetup
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './navigationTypes';

// Import screens (to be created later)
// These are placeholder imports until the actual screens are created
const WelcomeScreen = () => null;
const UsernameSetupScreen = () => null;

// Create the stack navigator
const Stack = createStackNavigator<AuthStackParamList>();

/**
 * AuthStack Component
 */
const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="UsernameSetup" component={UsernameSetupScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
