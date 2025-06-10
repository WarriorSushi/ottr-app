/**
 * Main Stack Navigator
 * 
 * Navigation stack for main app flow: Search ↔ Chat ↔ Settings
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainStackParamList } from './navigationTypes';

// Import screens (to be created later)
// These are placeholder imports until the actual screens are created
const SearchScreen = () => null;
const ChatScreen = () => null;
const SettingsScreen = () => null;

// Create the stack navigator
const Stack = createStackNavigator<MainStackParamList>();

/**
 * MainStack Component
 */
const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Search"
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
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;
