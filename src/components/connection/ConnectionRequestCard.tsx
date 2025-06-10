/**
 * ConnectionRequestCard Component
 * 
 * Displays a connection request with sender information, timestamp, and action buttons.
 * Used in the connection requests list to show incoming requests.
 */

import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { format, formatDistanceToNow } from 'date-fns';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import OttrText from '../common/OttrText';
import OttrCard from '../common/OttrCard';
import OttrButton from '../common/OttrButton';
import theme from '../../constants/theme';
import { ConnectionRequest } from '../../types/database';
import { useConnectionStore } from '../../store/connectionStore';

interface ConnectionRequestCardProps {
  request: ConnectionRequest;
  onRequestHandled?: () => void;
}

/**
 * ConnectionRequestCard Component
 */
const ConnectionRequestCard: React.FC<ConnectionRequestCardProps> = ({
  request,
  onRequestHandled,
}) => {
  // Local state for loading states
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  
  // Get actions from connection store
  const { acceptRequest, rejectRequest } = useConnectionStore();
  
  // Format the request timestamp
  const formatRequestTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const timeAgo = formatDistanceToNow(date, { addSuffix: true });
    return timeAgo;
  };
  
  // Handle accept request
  const handleAccept = async () => {
    setAcceptLoading(true);
    const success = await acceptRequest(request.id);
    setAcceptLoading(false);
    
    if (success && onRequestHandled) {
      onRequestHandled();
    }
  };
  
  // Handle reject request
  const handleReject = async () => {
    setRejectLoading(true);
    const success = await rejectRequest(request.id);
    setRejectLoading(false);
    
    if (success && onRequestHandled) {
      onRequestHandled();
    }
  };
  
  // Get the sender details
  const sender = request.from_user_details;
  
  // If no sender details, don't render
  if (!sender) return null;
  
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
    >
      <OttrCard style={styles.card}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <OttrText variant="h3" style={styles.displayName}>
                {sender.display_name}
              </OttrText>
              <OttrText variant="bodySmall" color={theme.colors.textSecondary}>
                {sender.username}
              </OttrText>
            </View>
            <OttrText
              variant="caption"
              color={theme.colors.textSecondary}
              style={styles.timestamp}
            >
              {formatRequestTime(request.created_at)}
            </OttrText>
          </View>
          
          <OttrText variant="body" style={styles.message}>
            wants to connect with you
          </OttrText>
          
          <View style={styles.actions}>
            <OttrButton
              title="Accept"
              variant="primary"
              size="small"
              onPress={handleAccept}
              loading={acceptLoading}
              style={styles.acceptButton}
              accessibilityLabel={`Accept connection request from ${sender.display_name}`}
            />
            <OttrButton
              title="Decline"
              variant="outline"
              size="small"
              onPress={handleReject}
              loading={rejectLoading}
              style={styles.rejectButton}
              accessibilityLabel={`Decline connection request from ${sender.display_name}`}
            />
          </View>
        </View>
      </OttrCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.m,
    marginHorizontal: theme.spacing.m,
  },
  container: {
    padding: theme.spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.s,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    marginBottom: theme.spacing.xs,
  },
  timestamp: {
    marginLeft: theme.spacing.s,
  },
  message: {
    marginBottom: theme.spacing.m,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  acceptButton: {
    marginRight: theme.spacing.s,
  },
  rejectButton: {},
});

export default ConnectionRequestCard;
