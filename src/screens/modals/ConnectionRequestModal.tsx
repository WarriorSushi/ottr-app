/**
 * ConnectionRequestModal
 * 
 * Modal overlay for displaying and handling incoming connection requests.
 * Features animations, accept/reject buttons, and auto-dismiss.
 */

import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Modal, 
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  Extrapolate,
  withTiming
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import OttrText from '../../components/common/OttrText';
import OttrButton from '../../components/common/OttrButton';
import theme from '../../constants/theme';
import { ConnectionRequest } from '../../types/database';
import { useConnectionStore } from '../../store/connectionStore';
import { format } from 'date-fns';

interface ConnectionRequestModalProps {
  visible: boolean;
  request: ConnectionRequest | null;
  onClose: () => void;
  onRequestHandled?: () => void;
}

const { width, height } = Dimensions.get('window');

/**
 * ConnectionRequestModal Component
 */
const ConnectionRequestModal: React.FC<ConnectionRequestModalProps> = ({
  visible,
  request,
  onClose,
  onRequestHandled,
}) => {
  // Animation values
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);
  
  // Local state for loading states
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  
  // Get actions from connection store
  const { acceptRequest, rejectRequest } = useConnectionStore();
  
  // Animate modal when visibility changes
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withSpring(height, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [visible, opacity, translateY]);
  
  // Animated styles
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(
      translateY.value,
      [height, height / 2, 0],
      [0, 0.5, 1],
      Extrapolate.CLAMP
    ),
  }));
  
  // Handle accept request
  const handleAccept = async () => {
    if (!request) return;
    
    setAcceptLoading(true);
    const success = await acceptRequest(request.id);
    setAcceptLoading(false);
    
    if (success) {
      if (onRequestHandled) onRequestHandled();
      onClose();
    }
  };
  
  // Handle reject request
  const handleReject = async () => {
    if (!request) return;
    
    setRejectLoading(true);
    const success = await rejectRequest(request.id);
    setRejectLoading(false);
    
    if (success) {
      if (onRequestHandled) onRequestHandled();
      onClose();
    }
  };
  
  // If no request, don't render content
  if (!request || !request.from_user_details) {
    return null;
  }
  
  const sender = request.from_user_details;
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.overlay, overlayStyle]} />
        </TouchableWithoutFeedback>
        
        <Animated.View style={[styles.modalContainer, modalStyle]}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <OttrText variant="h2">Connection Request</OttrText>
            <TouchableWithoutFeedback onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableWithoutFeedback>
          </View>
          
          <View style={styles.content}>
            <OttrText variant="h3" style={styles.displayName}>
              {sender.display_name}
            </OttrText>
            
            <OttrText variant="bodySmall" color={theme.colors.textSecondary} style={styles.username}>
              {sender.username}
            </OttrText>
            
            <OttrText variant="body" style={styles.message}>
              wants to connect with you on Ottr
            </OttrText>
            
            <OttrText variant="caption" color={theme.colors.textSecondary} style={styles.timestamp}>
              Sent {format(new Date(request.created_at), 'MMM d, yyyy • h:mm a')}
            </OttrText>
            
            <OttrText variant="body" style={styles.description}>
              Remember, in Ottr you can only have one active connection at a time.
              Accepting this request will make this person your exclusive chat partner.
            </OttrText>
          </View>
          
          <View style={styles.actions}>
            <OttrButton
              title="Decline"
              variant="outline"
              onPress={handleReject}
              loading={rejectLoading}
              style={styles.rejectButton}
              accessibilityLabel={`Decline connection request from ${sender.display_name}`}
            />
            <OttrButton
              title="Accept"
              variant="primary"
              onPress={handleAccept}
              loading={acceptLoading}
              style={styles.acceptButton}
              accessibilityLabel={`Accept connection request from ${sender.display_name}`}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.l,
    borderTopRightRadius: theme.radius.l,
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.xl + theme.spacing.m, // Extra padding for bottom safe area
    width: '100%',
    maxHeight: height * 0.8,
    ...theme.shadow.medium,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: theme.colors.disabled,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  content: {
    marginBottom: theme.spacing.l,
  },
  displayName: {
    marginBottom: theme.spacing.xs,
  },
  username: {
    marginBottom: theme.spacing.m,
  },
  message: {
    marginBottom: theme.spacing.s,
  },
  timestamp: {
    marginBottom: theme.spacing.l,
  },
  description: {
    backgroundColor: 'rgba(255, 190, 152, 0.1)', // Light primary color
    padding: theme.spacing.m,
    borderRadius: theme.radius.m,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.l,
  },
  rejectButton: {
    flex: 1,
    marginRight: theme.spacing.s,
  },
  acceptButton: {
    flex: 1,
    marginLeft: theme.spacing.s,
  },
});

export default ConnectionRequestModal;
