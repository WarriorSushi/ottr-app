import React, { useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import OttrText from '../../components/common/OttrText';
import OttrButton from '../../components/common/OttrButton';
import theme from '../../constants/theme';

interface DisconnectConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * DisconnectConfirmModal
 *
 * A reusable, accessible confirmation modal that asks the user to confirm the
 * disconnection action. It fades in/out and scales for a warm, friendly feel
 * aligned with the Peach Fuzz design system.
 */
const DisconnectConfirmModal: React.FC<DisconnectConfirmModalProps> = ({ visible, onConfirm, onCancel }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, opacity, scale]);

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel} accessible accessibilityLabel="Close disconnect confirmation" />
      <View style={styles.centerWrapper} pointerEvents="box-none">
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <OttrText variant="h3" style={styles.title} accessibilityLabel="Disconnect header">
            Disconnect?
          </OttrText>
          <OttrText style={styles.message} accessibilityLabel="Disconnect message">
            Are you sure you want to disconnect? Your chat history will be cleared on both devices.
          </OttrText>
          <View style={styles.btnRow}>
            <OttrButton title="Cancel" variant="secondary" onPress={onCancel} style={styles.btn} accessibilityLabel="Cancel disconnect" />
            <OttrButton title="Disconnect" variant="destructive" onPress={onConfirm} style={styles.btn} accessibilityLabel="Confirm disconnect" />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
  },
  title: {
    marginBottom: 12,
    color: '#2E2E2E',
  },
  message: {
    color: '#8D7A6B',
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default DisconnectConfirmModal;
