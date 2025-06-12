import React, { useState } from 'react';
import { View, StyleSheet, Modal, TextInput, Alert, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import OttrText from '../../components/common/OttrText';
import SettingItem from '../../components/settings/SettingItem';
import OttrButton from '../../components/common/OttrButton';
import OttrCard from '../../components/common/OttrCard';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useConnectionStore } from '../../store/connectionStore';
import supabase from '../../services/supabase/supabaseClient';
import { MainStackParamList } from '../../navigation/navigationTypes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type SettingsScreenProps = NativeStackScreenProps<MainStackParamList, 'Settings'>;

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, signOut, setUser } = useAuthStore();
  const { notificationsEnabled, toggleNotifications } = useSettingsStore();
  const {
    connectedUser,
    connectionStatus,
    disconnect,
  } = useConnectionStore();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.display_name || '');
  const [loadingName, setLoadingName] = useState(false);

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      Alert.alert('Invalid name', 'Display name cannot be empty');
      return;
    }
    setLoadingName(true);
    const { error } = await supabase
      .from('users')
      .update({ display_name: trimmed })
      .eq('id', user?.id);
    setLoadingName(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setUser({ ...user!, display_name: trimmed });
    setIsEditing(false);
  };

  const handleDisconnect = () => {
    if (!connectedUser) return;
    Alert.alert(
      'Disconnect',
      'Are you sure you want to disconnect? Chat history will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            const success = await disconnect(user!.id);
            if (success) {
              navigation.navigate('Search');
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Section */}
      <OttrCard style={styles.sectionCard}>
        <OttrText variant="h3">Profile</OttrText>
        <SettingItem
          label="Display Name"
          value={user?.display_name || ''}
          variant="info"
        />
        <OttrButton title="Edit" onPress={() => setIsEditing(true)} style={styles.editBtn} />
        <SettingItem label="Username" value={user?.username || ''} variant="info" />
      </OttrCard>

      {/* Connection Section */}
      <OttrCard style={styles.sectionCard}>
        <OttrText variant="h3">Connection</OttrText>
        <SettingItem
          label="Status"
          value={connectionStatus || 'disconnected'}
          variant="info"
        />
        {connectedUser && (
          <>
            <SettingItem
              label="Connected User"
              value={connectedUser.display_name}
              variant="info"
            />
            <OttrButton
              title="Disconnect"
              variant="secondary"
              onPress={handleDisconnect}
              style={styles.disconnectBtn}
            />
          </>
        )}
      </OttrCard>

      {/* Notifications */}
      <OttrCard style={styles.sectionCard}>
        <OttrText variant="h3">Notifications</OttrText>
        <SettingItem
          label="Enable Notifications"
          variant="toggle"
          value={notificationsEnabled}
          onToggle={toggleNotifications}
        />
      </OttrCard>

      {/* App Info */}
      <OttrCard style={styles.sectionCard}>
        <OttrText variant="h3">App</OttrText>
        <SettingItem label="Version" value={Constants.manifest?.version || '1.0.0'} variant="info" />
        <SettingItem
          label="Privacy Policy"
          variant="action"
          onPress={() => {
            // TODO: open privacy policy URL
          }}
        />
      </OttrCard>

      <OttrButton title="Sign Out" onPress={signOut} variant="secondary" style={styles.signOutBtn} />

      {/* Edit Name Modal */}
      <Modal visible={isEditing} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <OttrText>Edit Display Name</OttrText>
            <TextInput
              style={styles.input}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter display name"
            />
            <View style={styles.modalBtnRow}>
              <OttrButton title="Cancel" variant="secondary" onPress={() => setIsEditing(false)} />
              <OttrButton title="Save" onPress={handleSaveName} loading={loadingName} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionCard: {
    marginBottom: 16,
  },
  editBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  disconnectBtn: {
    marginTop: 12,
  },
  signOutBtn: {
    marginVertical: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default SettingsScreen;
