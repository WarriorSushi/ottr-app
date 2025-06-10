/**
 * UserCard Component
 * 
 * Displays user information with connection status and action buttons
 * using the Ottr Peach Fuzz design system.
 */

import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { User, ConnectionStatus } from '../../types/database';
import OttrText from '../common/OttrText';
import OttrCard from '../common/OttrCard';
import OttrButton from '../common/OttrButton';
import theme from '../../constants/theme';
import { CONNECTION_STATES } from '../../constants/config';
import { Ionicons } from '@expo/vector-icons';

interface UserCardProps {
  user: User;
  currentUserId: string;
  onConnect: (userId: string) => void;
  onViewChat: (userId: string) => void;
  requestStatus?: 'incoming' | 'outgoing' | null;
  isConnectLoading?: boolean;
  connectionStatus?: string | null;
}

/**
 * UserCard Component
 */
const UserCard: React.FC<UserCardProps> = ({
  user,
  currentUserId,
  onConnect,
  onViewChat,
  requestStatus = null,
  isConnectLoading = false,
  connectionStatus = null,
}) => {
  // Determine if this is the current user
  const isCurrentUser = user.id === currentUserId;

  // Determine connection state
  const isConnected = connectionStatus === 'connected' && user.connected_to === currentUserId;
  const isPending = requestStatus !== null || connectionStatus === 'pending';
  const isOutgoingRequest = requestStatus === 'outgoing';
  const isIncomingRequest = requestStatus === 'incoming';

  if (isCurrentUser) {
    return null;
  }

  // Determine connection status and appropriate action
  const renderConnectionStatus = () => {
    switch (user.connection_status) {
      case CONNECTION_STATES.CONNECTED:
        return (
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, styles.connectedBadge]}>
              <OttrText variant="caption" color={theme.colors.success}>
                Connected
              </OttrText>
            </View>
            {user.connected_to === currentUserId && (
              <OttrButton
                title="Chat"
                variant="secondary"
                size="small"
                onPress={() => onViewChat(user.id)}
                accessibilityLabel={`Chat with ${user.display_name}`}
              />
            )}
          </View>
        );

      case CONNECTION_STATES.PENDING:
        return (
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, styles.pendingBadge]}>
              <OttrText variant="caption" color={theme.colors.secondary}>
                Pending
              </OttrText>
            </View>
          </View>
        );

      case CONNECTION_STATES.DISCONNECTED:
        return (
          <View style={styles.statusContainer}>
            <OttrButton
              title="Connect"
              variant="outline"
              size="small"
              onPress={() => onConnect(user.id)}
              accessibilityLabel={`Connect with ${user.display_name}`}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <OttrCard style={styles.card}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.8}
        onPress={() => {
          if (user.connection_status === CONNECTION_STATES.CONNECTED && user.connected_to === currentUserId) {
            onViewChat(user.id);
          }
        }}
      >
        <View style={styles.userInfo}>
          <OttrText variant="h3" style={styles.displayName}>
            {user.display_name}
          </OttrText>
          <OttrText variant="bodySmall" color={theme.colors.textSecondary}>
            {user.username}
          </OttrText>
        </View>

        {renderConnectionStatus()}

        {/* Action buttons */}
        <View style={styles.actions}>
          {isCurrentUser ? (
            <OttrText variant="bodySmall" color={theme.colors.textSecondary}>
              This is you
            </OttrText>
          ) : isConnected ? (
            <OttrButton
              title="Chat"
              variant="primary"
              size="small"
              onPress={() => onViewChat(user.id)}
              style={styles.chatButton}
              accessibilityLabel={`Chat with ${user.display_name}`}
            />
          ) : isOutgoingRequest ? (
            <View style={styles.requestSent}>
              <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
              <OttrText
                variant="bodySmall"
                color={theme.colors.textSecondary}
                style={styles.requestText}
              >
                Request sent
              </OttrText>
            </View>
          ) : isIncomingRequest ? (
            <OttrButton
              title="Respond"
              variant="primary"
              size="small"
              onPress={() => onConnect(user.id)}
              style={styles.connectButton}
              accessibilityLabel={`Respond to request from ${user.display_name}`}
            />
          ) : (
            <OttrButton
              title="Connect"
              variant="primary"
              size="small"
              onPress={() => onConnect(user.id)}
              loading={isConnectLoading}
              disabled={isPending || connectionStatus === 'connected'}
              style={styles.connectButton}
              accessibilityLabel={`Connect with ${user.display_name}`}
            />
          )}
        </View>
      </TouchableOpacity>
    </OttrCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.m,
    marginHorizontal: theme.spacing.m,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.m,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    marginBottom: theme.spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.s,
    marginRight: theme.spacing.s,
  },
  connectedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 183, 77, 0.1)',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectButton: {
    marginRight: theme.spacing.s,
  },
  chatButton: {},
  requestSent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.s,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.radius.m,
  },
  requestText: {
    marginLeft: theme.spacing.xs,
  },
});

export default UserCard;
