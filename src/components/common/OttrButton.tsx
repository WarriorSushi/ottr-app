/**
 * OttrButton Component
 * 
 * A customizable button component for the Ottr app with primary and secondary variants.
 * Features spring animations using React Native Reanimated.
 */

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  View,
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  StyleProp 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import theme from '../../constants/theme';
import animations from '../../constants/animations';
import { triggerLightImpact } from '@utils/haptics';

// Animated TouchableOpacity
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive';

// Button sizes
export type ButtonSize = 'small' | 'medium' | 'large';

// Button props interface
export interface OttrButtonProps {
  children?: React.ReactNode;
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

/**
 * OttrButton Component
 */
const OttrButton: React.FC<OttrButtonProps> = ({
  children,
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  // Animation values
  const scale = useSharedValue(1);

  // Handle press in animation
  const handlePressIn = () => {
    scale.value = withSpring(0.96, animations.SPRINGS.RESPONSIVE);
  };

  // Handle press out animation
  const handlePressOut = () => {
    scale.value = withSpring(1, animations.SPRINGS.RESPONSIVE);
  };

  // Handle press
  const handlePress = () => {
    if (disabled) return;
    triggerLightImpact();
    onPress?.();
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Get button styles based on variant and size
  const getButtonStyles = (): StyleProp<ViewStyle> => {
    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      destructive: {
        backgroundColor: theme.colors.accent, // use accent (#FF8A80)
      },
    };

    const sizeStyles = {
      small: {
        height: 36,
        paddingHorizontal: theme.spacing.m,
      },
      medium: {
        height: 48,
        paddingHorizontal: theme.spacing.l,
      },
      large: {
        height: 56,
        paddingHorizontal: theme.spacing.xl,
      },
    };

    const widthStyle = fullWidth ? { width: '100%' as const } : {};
    const disabledStyle = disabled ? { opacity: 0.5 } : {};

    return [
      styles.button,
      variantStyles[variant],
      sizeStyles[size],
      widthStyle,
      disabledStyle,
      style,
    ];
  };

  // Get text styles based on variant
  const getTextStyles = (): StyleProp<TextStyle> => {
    const variantTextStyles = {
      primary: {
        color: '#FFFFFF',
      },
      secondary: {
        color: '#FFFFFF',
      },
      outline: {
        color: theme.colors.primary,
      },
      destructive: {
        color: '#FFFFFF',
      },
    };

    const sizeTextStyles = {
      small: {
        fontSize: theme.typography.fontSize.s,
      },
      medium: {
        fontSize: theme.typography.fontSize.m,
      },
      large: {
        fontSize: theme.typography.fontSize.l,
      },
    };

    return [
      styles.text,
      variantTextStyles[variant],
      sizeTextStyles[size],
      textStyle,
    ];
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[getButtonStyles(), animatedStyle]}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.colors.primary : '#FFFFFF'} />
      ) : children ? (
        children
      ) : title ? (
        <Text style={getTextStyles()}>
          {title}
        </Text>
      ) : null}
      {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
      {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.m,
  },
  text: {
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: theme.spacing.xs,
  },
  iconRight: {
    marginLeft: theme.spacing.xs,
  },
});

export default OttrButton;
