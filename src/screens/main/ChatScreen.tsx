/**
 * ChatScreen
 * 
 * Main chat interface for the Ottr exclusive messaging app.
 * Features a header with connected user info, message list, and input field.
 * Integrates with messageStore for real-time messaging functionality.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  AppState,
  AppStateStatus
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '../../navigation/navigationTypes';
import OttrText from '../../components/common/OttrText';
import MessageList from '../../components/chat/MessageList';
import MessageInput from '../../components/chat/MessageInput';
import TypingIndicator from '../../components/chat/TypingIndicator';
import theme from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useConnectionStore } from '../../store/connectionStore';
import { useMessageStore } from '../../store/messageStore';
import { Message } from '../../types/database';



type ChatScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'Chat'>;
  route: {
    params: {
      username: string;
      userId?: string;
    };
  };
};

/**
 * ChatScreen Component
 */
const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  // Get the connected user's username and ID from route params
  const { username, userId } = route.params;
  
  // Get state from stores
  const { user } = useAuthStore();
  const { connectedUser, getConnectedUser } = useConnectionStore();
  const { 
    messages,
    isLoadingMessages,
    isLoadingMore,
    isSendingMessage,
    partnerIsTyping,
    error,
    initializeStore,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    cleanupSubscriptions,
    resetStore
  } = useMessageStore();
  
  // Reference to track app state
  const appState = useRef(AppState.currentState);
  
  // Initialize message store and set up listeners when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        // Get connected user details
        const partnerId = userId || connectedUser?.id;
        if (partnerId) {
          // Initialize message store with user IDs
          initializeStore(user.id, partnerId);
        } else {
          // If no partner ID yet, get connected user first
          getConnectedUser(user.id).then(response => {
            if (response?.success && response.data) {
              initializeStore(user.id, response.data.id);
            }
          });
        }
      }
      
      // Set up app state listener for background/foreground transitions
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      
      return () => {
        // Clean up subscriptions when leaving the screen
        cleanupSubscriptions();
        subscription.remove();
      };
    }, [user?.id, userId, connectedUser?.id])
  );
  
  // Handle app state changes (background/foreground)
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      if (user?.id && (userId || connectedUser?.id)) {
        // Refresh messages
        loadMessages(user.id, userId || connectedUser?.id as string, true);
      }
    }
    
    appState.current = nextAppState;
  };
  
  // Refresh messages
  const handleRefreshMessages = () => {
    if (!user?.id || !(userId || connectedUser?.id)) return;
    
    loadMessages(user.id, userId || connectedUser?.id, true);
  };
  
  // Load more messages when scrolling up
  const handleLoadMoreMessages = () => {
    if (!user?.id || !(userId || connectedUser?.id)) return;
    
    loadMoreMessages(user.id, userId || connectedUser?.id);
  };
  
  // Send a new message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // The sendMessage function from the store handles all the logic
    await sendMessage(content);
  };
  
  // Navigate to settings
  const handleGoToSettings = () => {
    navigation.navigate('Settings');
  };
  
  // Render the header with connected user info
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <OttrText variant="h3" numberOfLines={1} style={styles.displayName}>
              {connectedUser?.display_name || username}
            </OttrText>
            <OttrText variant="caption" color={theme.colors.textSecondary} numberOfLines={1}>
              {connectedUser?.username || username}
            </OttrText>
          </View>
          
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleGoToSettings}
            accessibilityLabel="Chat settings"
          >
            <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {error && (
          <View style={styles.errorContainer}>
            <OttrText variant="caption" color={theme.colors.error}>
              {error}
            </OttrText>
          </View>
        )}
        
        <MessageList
          messages={messages}
          currentUserId={user?.id || ''}
          isLoading={isLoadingMessages}
          onRefresh={handleRefreshMessages}
          onEndReached={handleLoadMoreMessages}
        />
        
        {partnerIsTyping && (
          <TypingIndicator username={connectedUser?.username || username} />
        )}
        
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isSendingMessage}
          placeholder="Type a message..."
          showCharacterCount={true}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.disabled,
    ...theme.shadow.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  userInfo: {
    flex: 1,
    marginHorizontal: theme.spacing.s,
  },
  displayName: {
    marginBottom: 2,
  },
  settingsButton: {
    padding: theme.spacing.xs,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    padding: theme.spacing.s,
    margin: theme.spacing.m,
    borderRadius: theme.radius.m,
    alignItems: 'center',
  },
});

export default ChatScreen;
