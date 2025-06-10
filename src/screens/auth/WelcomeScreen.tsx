/**
 * Welcome Screen
 * 
 * The initial screen shown to users when they first open the Ottr app.
 * Features the Ottr logo, welcome message, tagline, and Google sign-in button.
 */

import React, { useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/navigationTypes';
import OttrButton from '../../components/common/OttrButton';
import OttrText from '../../components/common/OttrText';
import theme from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

// Type for navigation prop
type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

/**
 * WelcomeScreen Component
 */
const WelcomeScreen: React.FC = () => {
  // Navigation
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  
  // Auth store
  const { signIn, isLoading, isAuthenticated, error, clearError } = useAuthStore();

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      // Navigate to username setup
      navigation.navigate('UsernameSetup');
    }
  }, [isAuthenticated, navigation]);

  // Handle sign in with Google
  const handleSignIn = async () => {
    clearError();
    await signIn();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/ottr-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <View style={styles.textContainer}>
          <OttrText variant="h1" weight="bold" center>
            Welcome to Ottr
          </OttrText>
          <OttrText 
            variant="h3" 
            weight="medium" 
            color={theme.colors.textSecondary}
            center
            style={styles.tagline}
          >
            One person, one conversation
          </OttrText>
          <OttrText 
            variant="body" 
            color={theme.colors.textSecondary}
            center
            style={styles.description}
          >
            Connect with someone special and focus on what matters most - your conversation.
          </OttrText>
        </View>

        {/* Sign In Button */}
        <View style={styles.buttonContainer}>
          <OttrButton
            onPress={handleSignIn}
            disabled={isLoading}
            fullWidth
            accessibilityLabel="Sign in with Google"
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.surface} />
            ) : (
              <>
                <Image
                  source={require('../../../assets/google-icon.png')}
                  style={styles.googleIcon}
                />
                <OttrText variant="button" weight="medium" color={theme.colors.surface}>
                  Sign in with Google
                </OttrText>
              </>
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
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.l,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
  },
  textContainer: {
    alignItems: 'center',
  },
  tagline: {
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.m,
  },
  description: {
    maxWidth: 300,
  },
  buttonContainer: {
    marginBottom: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.l,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: theme.spacing.s,
  },
  errorText: {
    marginTop: theme.spacing.m,
  },
});

export default WelcomeScreen;
