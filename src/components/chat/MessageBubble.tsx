/**
 * MessageBubble Component
 * 
 * Displays a single message in the chat interface with different styles
 * for sent and received messages, timestamps, and read indicators.
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Pressable } from 'react-native';
import Animated, { SlideInRight, SlideInLeft } from 'react-native-reanimated';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import OttrText from '../common/OttrText';
import theme from '../../constants/theme';
import { Message } from '../../types/database';
import { useMessageStore } from '../../store/messageStore';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showTimestamp: boolean;
  isLastInGroup: boolean;
  /**
   * Local message status used for UI feedback.
   * - sending: Optimistic message waiting for server confirmation
   * - sent: Successfully persisted to DB but not yet read
   * - read: Read by recipient (read_at !== null)
   * - failed: Failed to send; show retry button
   */
  status?: 'sending' | 'sent' | 'read' | 'failed';
}

/**
 * MessageBubble Component
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  showTimestamp,
  isLastInGroup,
  status: propStatus,
}) => {
  // Format the message timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);

    // Show relative time for recent messages (<24h) otherwise calendar date
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffSec = diffMs / 1000;
    const diffMin = diffSec / 60;
    const diffHr = diffMin / 60;

    if (diffMin < 1) return 'Just now';
    if (diffHr < 1) return `${Math.floor(diffMin)}m ago`;
    if (diffHr < 12) return `${Math.floor(diffHr)}h ago`;

    // Fallback to formatted date
    return format(date, 'MMM d, h:mm a');
  };

  // Determine if the message has been read
  const isRead = message.read_at !== null;

  // Resolve display status
  const status: 'sending' | 'sent' | 'read' | 'failed' = propStatus ??
    // @ts-ignore - localStatus optional on Message type
    (message.localStatus as any) ?? (isRead ? 'read' : 'sent');

  // Retry handler
  const handleRetry = () => {
    useMessageStore.getState().retryFailedMessage(message.id);
  };

  const handleLongPress = () => {
    Alert.alert('Message options', 'Future actions coming soon', [
      { text: 'OK' },
    ]);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isCurrentUser ? styles.sentContainer : styles.receivedContainer,
      ]}
      entering={isCurrentUser ? SlideInRight.duration(300) : SlideInLeft.duration(300)}
    >
      <Pressable
        style={[
          styles.bubble,
          isCurrentUser ? styles.sentBubble : styles.receivedBubble,
          isLastInGroup && (isCurrentUser ? styles.sentLastBubble : styles.receivedLastBubble),
        ]}
        onLongPress={handleLongPress}
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
                {status === 'sending' && (
                  <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                )}
                {status === 'sent' && (
                  <Ionicons name="checkmark" size={14} color={theme.colors.textSecondary} />
                )}
                {status === 'read' && (
                  <Ionicons name="checkmark-done" size={14} color={theme.colors.accent} />
                )}
                {status === 'failed' && (
                  <Ionicons name="alert" size={14} color={theme.colors.error} />
                )}
              </View>
            )}
          </View>
        )}

        {/* Retry button for failed messages */}
        {status === 'failed' && isCurrentUser && (
          <TouchableOpacity onPress={handleRetry}>
            <Ionicons
              name="refresh"
              size={18}
              color={theme.colors.accent}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        )}
      </Pressable>
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
