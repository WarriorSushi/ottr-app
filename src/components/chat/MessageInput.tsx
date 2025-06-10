/**
 * MessageInput Component
 * 
 * Input field for typing and sending messages in the chat interface.
 * Features send button, text input with auto-grow, typing indicator management,
 * character limit, validation, and animations.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity,
  Keyboard,
  Platform,
  Text
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useMessageStore } from '../../store/messageStore';
import OttrText from '../common/OttrText';
import theme from '../../constants/theme';

// Maximum message length
const MAX_MESSAGE_LENGTH = 500;

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  showCharacterCount?: boolean;
  onTypingStatusChange?: (isTyping: boolean) => void;
}

/**
 * MessageInput Component
 */
const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = 'Type a message...',
  showCharacterCount = true,
  onTypingStatusChange,
}) => {
  // State for the message text
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showError, setShowError] = useState(false);
  
  // Get typing status setter from message store
  const setTypingStatus = useMessageStore(state => state.setTypingStatus);
  const isSendingMessage = useMessageStore(state => state.isSendingMessage);
  
  // Refs for typing indicator timeout and input
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);
  
  // Animation values
  const sendButtonScale = useSharedValue(0.8);
  const inputHeight = useSharedValue(44);
  const errorOpacity = useSharedValue(0);
  
  // Animated styles
  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
    opacity: message.length > 0 && message.length <= MAX_MESSAGE_LENGTH ? withTiming(1) : withTiming(0.5),
  }));
  
  const inputContainerStyle = useAnimatedStyle(() => ({
    height: inputHeight.value,
  }));
  
  const errorMessageStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
    transform: [{ translateY: errorOpacity.value * 10 }],
  }));
  
  // Effect to handle typing indicator
  useEffect(() => {
    // Clear previous timeout if it exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // If message is not empty, set typing to true
    if (message.trim() !== '' && !isTyping) {
      setIsTyping(true);
      setTypingStatus(true);
      if (onTypingStatusChange) onTypingStatusChange(true);
    }
    
    // Set timeout to clear typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        setTypingStatus(false);
        if (onTypingStatusChange) onTypingStatusChange(false);
      }
    }, 2000);
    
    // Cleanup timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, setTypingStatus, onTypingStatusChange]);
  
  // Handle sending a message
  const handleSendMessage = () => {
    // Validate message
    if (message.trim() === '' || isLoading || isSendingMessage) return;
    if (message.length > MAX_MESSAGE_LENGTH) {
      setShowError(true);
      errorOpacity.value = withTiming(1, { duration: 300 });
      setTimeout(() => {
        errorOpacity.value = withTiming(0, { duration: 300 });
        setShowError(false);
      }, 3000);
      return;
    }
    
    // Send the message
    onSendMessage(message.trim());
    setMessage('');
    
    // Reset typing status
    setIsTyping(false);
    setTypingStatus(false);
    if (onTypingStatusChange) onTypingStatusChange(false);
    
    // Animate the send button
    sendButtonScale.value = withTiming(1, { duration: 100 }, () => {
      sendButtonScale.value = withTiming(0.8, { duration: 100 });
    });
    
    // Focus the input after sending
    inputRef.current?.focus();
  };
  
  // Handle text input changes
  const handleChangeText = (text: string) => {
    // Prevent exceeding character limit in the UI
    if (text.length > MAX_MESSAGE_LENGTH + 50) {
      return;
    }
    
    setMessage(text);
    
    // Show error if over character limit
    if (text.length > MAX_MESSAGE_LENGTH && !showError) {
      setShowError(true);
      errorOpacity.value = withTiming(1, { duration: 300 });
    } else if (text.length <= MAX_MESSAGE_LENGTH && showError) {
      errorOpacity.value = withTiming(0, { duration: 300 });
      setShowError(false);
    }
  };
  
  // Handle content size change for auto-growing input
  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const newHeight = Math.min(Math.max(44, height), 100); // Min 44, max 100
    inputHeight.value = withTiming(newHeight, { duration: 150 });
  };
  
  // Handle key press to send message on Enter (unless shift is pressed)
  const handleKeyPress = (e: any) => {
    if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Error message for character limit */}
      {showError && (
        <Animated.View style={[styles.errorContainer, errorMessageStyle]}>
          <OttrText variant="caption" color={theme.colors.error}>
            Message cannot exceed {MAX_MESSAGE_LENGTH} characters
          </OttrText>
        </Animated.View>
      )}
      
      <Animated.View style={[styles.inputContainer, inputContainerStyle]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={message}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          onContentSizeChange={handleContentSizeChange}
          editable={!isLoading && !isSendingMessage}
          onKeyPress={handleKeyPress}
        />
        
        {/* Character count */}
        {showCharacterCount && message.length > 0 && (
          <View style={[styles.characterCount, message.length > MAX_MESSAGE_LENGTH ? styles.characterCountError : null]}>
            <OttrText 
              variant="caption" 
              color={message.length > MAX_MESSAGE_LENGTH ? theme.colors.error : theme.colors.textSecondary}
            >
              {message.length}/{MAX_MESSAGE_LENGTH}
            </OttrText>
          </View>
        )}
        
        <Animated.View style={[styles.sendButtonContainer, sendButtonStyle]}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (message.trim() === '' || isLoading || isSendingMessage || message.length > MAX_MESSAGE_LENGTH) 
                ? styles.sendButtonDisabled 
                : null,
            ]}
            onPress={handleSendMessage}
            disabled={message.trim() === '' || isLoading || isSendingMessage || message.length > MAX_MESSAGE_LENGTH}
            activeOpacity={0.7}
          >
            {isLoading || isSendingMessage ? (
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={theme.colors.surface}
              />
            ) : (
              <Ionicons
                name="paper-plane"
                size={20}
                color={theme.colors.surface}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.disabled,
    backgroundColor: theme.colors.surface,
  },
  errorContainer: {
    position: 'absolute',
    top: -24,
    left: theme.spacing.m,
    right: theme.spacing.m,
    backgroundColor: theme.colors.surfaceSecondary,
    padding: theme.spacing.xs,
    borderRadius: 8,
    ...theme.shadow.light,
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 24,
    paddingHorizontal: theme.spacing.m,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    maxHeight: 100,
  },
  characterCount: {
    position: 'absolute',
    right: 48,
    bottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  characterCountError: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  sendButtonContainer: {
    marginLeft: theme.spacing.s,
  },
  sendButton: {
    backgroundColor: theme.colors.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.light,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
});

export default MessageInput;
