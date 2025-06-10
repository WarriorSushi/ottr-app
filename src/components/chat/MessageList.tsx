/**
 * MessageList Component
 * 
 * Displays a list of messages with optimized performance,
 * message grouping, date separators, and inverted layout.
 */

import React, { useCallback, useMemo, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  ListRenderItemInfo 
} from 'react-native';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import Animated, { FadeIn } from 'react-native-reanimated';
import OttrText from '../common/OttrText';
import MessageBubble from './MessageBubble';
import theme from '../../constants/theme';
import { Message } from '../../types/database';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
}

// Type for grouped messages with date headers
type MessageOrDateSeparator = 
  | { type: 'message'; message: Message; showTimestamp: boolean; isLastInGroup: boolean }
  | { type: 'dateSeparator'; date: Date; text: string };

/**
 * MessageList Component
 */
const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isLoading,
  onRefresh,
  onEndReached,
}) => {
  // Reference to the FlatList for scrolling
  const flatListRef = useRef<FlatList>(null);
  
  // Format date for separator
  const formatDateSeparator = (date: Date): string => {
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };
  
  // Process messages to add date separators and determine which messages should show timestamps
  const processedMessages = useMemo(() => {
    if (!messages.length) return [];
    
    const result: MessageOrDateSeparator[] = [];
    let lastDate: Date | null = null;
    let lastSenderId: string | null = null;
    
    // Process in reverse order since we're using an inverted list
    // This way we can determine the first message in each group (which will be the last when inverted)
    [...messages].reverse().forEach((message, index, array) => {
      const messageDate = new Date(message.created_at);
      const currentDay = new Date(
        messageDate.getFullYear(),
        messageDate.getMonth(),
        messageDate.getDate()
      );
      
      // Add date separator if this is a new day
      if (!lastDate || !isSameDay(lastDate, currentDay)) {
        result.push({
          type: 'dateSeparator',
          date: currentDay,
          text: formatDateSeparator(currentDay),
        });
        lastDate = currentDay;
      }
      
      // Determine if this message should show a timestamp
      // Show timestamp if it's the last message in a group or if it's the last message overall
      const isLastMessage = index === array.length - 1;
      const isNewSender = lastSenderId !== message.from_user;
      const nextMessage = array[index + 1];
      const isLastInGroup = isLastMessage || 
                           isNewSender || 
                           (nextMessage && nextMessage.from_user !== message.from_user) ||
                           (nextMessage && 
                            new Date(nextMessage.created_at).getTime() - messageDate.getTime() > 5 * 60 * 1000); // 5 minutes gap
      
      // Add the message
      result.push({
        type: 'message',
        message,
        showTimestamp: isLastInGroup,
        isLastInGroup,
      });
      
      lastSenderId = message.from_user;
    });
    
    // Reverse back for the inverted list
    return result.reverse();
  }, [messages]);
  
  // Render a message or date separator
  const renderItem = useCallback(({ item }: ListRenderItemInfo<MessageOrDateSeparator>) => {
    if (item.type === 'dateSeparator') {
      return (
        <Animated.View 
          style={styles.dateSeparator}
          entering={FadeIn.duration(300)}
        >
          <OttrText variant="caption" color={theme.colors.textSecondary}>
            {item.text}
          </OttrText>
        </Animated.View>
      );
    } else {
      return (
        <MessageBubble
          message={item.message}
          isCurrentUser={item.message.from_user === currentUserId}
          showTimestamp={item.showTimestamp}
          isLastInGroup={item.isLastInGroup}
        />
      );
    }
  }, [currentUserId]);
  
  // Key extractor for FlatList
  const keyExtractor = useCallback((item: MessageOrDateSeparator) => {
    if (item.type === 'dateSeparator') {
      return `date-${item.date.getTime()}`;
    } else {
      return `message-${item.message.id}`;
    }
  }, []);
  
  // Scroll to bottom (latest messages)
  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };
  
  // Render empty state
  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <OttrText variant="body" color={theme.colors.textSecondary}>
          No messages yet. Start the conversation!
        </OttrText>
      </View>
    );
  };
  
  // Render loading footer
  const renderFooter = () => {
    if (!isLoading || messages.length === 0) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={theme.colors.primary} size="small" />
      </View>
    );
  };
  
  return (
    <FlatList
      ref={flatListRef}
      data={processedMessages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      inverted={true} // New messages at bottom
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={21}
      getItemLayout={(data, index) => ({
        length: 60, // Approximate height of a message
        offset: 60 * index,
        index,
      })}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: theme.spacing.m,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: theme.spacing.m,
  },
  footerLoader: {
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
  },
});

export default MessageList;
