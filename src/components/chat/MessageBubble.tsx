/**
 * MessageBubble Component
 * 
 * Displays a single message in the chat interface with different styles
 * for sent and received messages, timestamps, and read indicators.
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { FadeIn, SlideInRight, SlideInLeft } from 'react-native-reanimated';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import OttrText from '../common/OttrText';
import theme from '../../constants/theme';
import { Message } from '../../types/database';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showTimestamp: boolean;
  isLastInGroup: boolean;
}

/**
 * MessageBubble Component
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  showTimestamp,
  isLastInGroup,
}) => {
  // Format the message timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'h:mm a');
  };

  // Determine if the message has been read
  const isRead = message.read_at !== null;

  return (
    <Animated.View
      style={[
        styles.container,
        isCurrentUser ? styles.sentContainer : styles.receivedContainer,
      ]}
      entering={isCurrentUser ? SlideInRight.duration(300) : SlideInLeft.duration(300)}
    >
      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.sentBubble : styles.receivedBubble,
          isLastInGroup && (isCurrentUser ? styles.sentLastBubble : styles.receivedLastBubble),
        ]}
      >
        <OttrText variant="body" style={styles.messageText}>
          {message.content}
        </OttrText>
        
        {showTimestamp && (
          <View style={styles.timestampContainer}>
            <OttrText variant="caption" color={theme.colors.textSecondary} style={styles.timestamp}>
              {formatMessageTime(message.created_at)}
            </OttrText>
            
            {isCurrentUser && (
              <View style={styles.readIndicator}>
                {isRead ? (
                  <Ionicons
                    name="checkmark-done"
                    size={14}
                    color={theme.colors.accent}
                  />
                ) : (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={theme.colors.textSecondary}
                  />
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: theme.spacing.m,
    maxWidth: '80%',
  },
  sentContainer: {
    alignSelf: 'flex-end',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    minWidth: 60,
  },
  sentBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderBottomLeftRadius: 4,
  },
  sentLastBubble: {
    borderBottomRightRadius: 18,
  },
  receivedLastBubble: {
    borderBottomLeftRadius: 18,
  },
  messageText: {
    color: theme.colors.textPrimary,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    marginRight: 4,
  },
  readIndicator: {
    marginLeft: 2,
  },
});

export default MessageBubble;
