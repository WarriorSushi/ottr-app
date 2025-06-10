/**
 * Username Setup Screen
 * 
 * Screen for new users to set up their username and display name.
 * Features real-time username availability checking.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/navigationTypes';
import OttrButton from '../../components/common/OttrButton';
import OttrText from '../../components/common/OttrText';
import OttrInput from '../../components/common/OttrInput';
import theme from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../services/supabase/supabaseClient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing
} from 'react-native-reanimated';

// Type for navigation prop
type UsernameSetupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'UsernameSetup'>;

/**
 * UsernameSetupScreen Component
 */
const UsernameSetupScreen: React.FC = () => {
  // Navigation
  const navigation = useNavigation<UsernameSetupScreenNavigationProp>();
  
  // Auth store
  const { setupProfile, isLoading, error, clearError, user } = useAuthStore();

  // Local state
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');

  // Animation values
  const headerOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  // Animate elements on mount
  useEffect(() => {
    headerOpacity.value = withTiming(1, { 
      duration: 600, 
      easing: Easing.out(Easing.ease) 
    });
    
    formOpacity.value = withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.ease) 
    });
  }, []);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ 
      translateY: withTiming(headerOpacity.value * 0, { 
        duration: 600, 
        easing: Easing.out(Easing.ease) 
      }) 
    }]
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ 
      translateY: withTiming((1 - formOpacity.value) * 20, { 
        duration: 800, 
        easing: Easing.out(Easing.ease) 
      }) 
    }]
  }));

  // Check if username is available
  const checkUsernameAvailability = async (value: string) => {
    // Skip check if username is empty or too short
    if (!value || value.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }

    try {
      setIsCheckingUsername(true);
      
      // Format username to ensure it starts with @
      const formattedUsername = value.startsWith('@') ? value : `@${value}`;
      
      // Check if username exists in database
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', formattedUsername)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is good (username is available)
        console.error('Error checking username:', error);
        setIsUsernameAvailable(null);
      } else {
        // If data exists, username is taken
        setIsUsernameAvailable(!data);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setIsUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Handle username change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username.length >= 3) {
        checkUsernameAvailability(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  // Validate username
  const validateUsername = (value: string) => {
    if (!value) {
      setUsernameError('Username is required');
      return false;
    }
    
    // Remove @ if present for validation
    const usernameWithoutAt = value.startsWith('@') ? value.substring(1) : value;
    
    if (usernameWithoutAt.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(usernameWithoutAt)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    
    if (!isUsernameAvailable) {
      setUsernameError('Username is already taken');
      return false;
    }
    
    setUsernameError('');
    return true;
  };

  // Validate display name
  const validateDisplayName = (value: string) => {
    if (!value) {
      setDisplayNameError('Display name is required');
      return false;
    }
    
    if (value.length < 2) {
      setDisplayNameError('Display name must be at least 2 characters');
      return false;
    }
    
    setDisplayNameError('');
    return true;
  };

  // Handle continue button press
  const handleContinue = async () => {
    // Clear any previous errors
    clearError();
    
    // Validate inputs
    const isUsernameValid = validateUsername(username);
    const isDisplayNameValid = validateDisplayName(displayName);
    
    if (!isUsernameValid || !isDisplayNameValid) {
      return;
    }
    
    // Set up profile
    const success = await setupProfile(username, displayName);
    
    if (success) {
      // Navigate to main app
      // This will be handled by the AppNavigator since the user is now authenticated
      // and has a profile
    }
  };

  // Determine if continue button should be disabled
  const isContinueDisabled = 
    isLoading || 
    isCheckingUsername || 
    !username || 
    !displayName || 
    !!usernameError || 
    !!displayNameError ||
    isUsernameAvailable === false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Header */}
            <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
              <OttrText variant="h2" weight="bold" center>
                Create Your Profile
              </OttrText>
              <OttrText 
                variant="body" 
                color={theme.colors.textSecondary}
                center
                style={styles.subtitle}
              >
                Choose a unique username and display name for your Ottr profile
              </OttrText>
            </Animated.View>

            {/* Form */}
            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
              {/* Username Input */}
              <OttrInput
                label="Username"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setUsernameError('');
                }}
                placeholder="@username"
                autoCapitalize="none"
                autoCorrect={false}
                error={usernameError}
                helperText={
                  isCheckingUsername
                    ? 'Checking availability...'
                    : isUsernameAvailable === true
                    ? 'Username is available!'
                    : isUsernameAvailable === false
                    ? 'Username is already taken'
                    : 'Username must be unique'
                }
                helperTextColor={
                  isUsernameAvailable === true
                    ? theme.colors.success
                    : isUsernameAvailable === false
                    ? theme.colors.error
                    : theme.colors.textSecondary
                }
                rightIcon={
                  isCheckingUsername
                    ? <ActivityIndicator size="small" color={theme.colors.primary} />
                    : isUsernameAvailable === true
                    ? '✓'
                    : isUsernameAvailable === false
                    ? '✗'
                    : undefined
                }
                rightIconColor={
                  isUsernameAvailable === true
                    ? theme.colors.success
                    : theme.colors.error
                }
                style={styles.input}
              />

              {/* Display Name Input */}
              <OttrInput
                label="Display Name"
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  setDisplayNameError('');
                }}
                placeholder="Your name"
                error={displayNameError}
                style={styles.input}
              />

              {/* Continue Button */}
              <OttrButton
                onPress={handleContinue}
                disabled={isContinueDisabled}
                fullWidth
                style={styles.continueButton}
                accessibilityLabel="Continue to Ottr"
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.colors.surface} />
                ) : (
                  <OttrText variant="button" weight="medium" color={theme.colors.surface}>
                    Continue
                  </OttrText>
                )}
              </OttrButton>

              {/* Error Message */}
              {error && (
                <OttrText
                  variant="bodySmall"
                  color={theme.colors.error}
                  center
                  style={styles.errorText}
                >
                  {error}
                </OttrText>
              )}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: theme.spacing.l,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: theme.spacing.xl,
  },
  subtitle: {
    marginTop: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: theme.spacing.m,
  },
  continueButton: {
    marginTop: theme.spacing.m,
  },
  errorText: {
    marginTop: theme.spacing.m,
  },
});

export default UsernameSetupScreen;
