/**
 * OttrInput Component
 * 
 * A customizable text input component for the Ottr app with warm styling
 * and coral focus border.
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import theme from '../../constants/theme';

// Input props interface
export interface OttrInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  helperText?: string;
  helperTextColor?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightIconColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  helperStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}

/**
 * OttrInput Component
 */
const OttrInput: React.FC<OttrInputProps> = ({
  label,
  error,
  helper,
  helperText,
  helperTextColor,
  leftIcon,
  rightIcon,
  rightIconColor,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}) => {
  // State for focus
  const [isFocused, setIsFocused] = useState(false);
  
  // Animation value for focus state
  const focusAnim = useSharedValue(0);

  // Handle focus event
  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: 200 });
    onFocus?.(e);
  };

  // Handle blur event
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, { duration: 200 });
    onBlur?.(e);
  };

  // Animated border style
  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        focusAnim.value,
        [0, 1],
        [error ? theme.colors.error : theme.colors.disabled, theme.colors.accent]
      ),
    };
  });

  return (
    <View style={[styles.container, containerStyle, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <Animated.View 
        style={[
          styles.inputContainer, 
          error ? styles.errorBorder : null,
          animatedBorderStyle
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        
        {rightIcon && <View style={styles.rightIcon}>
          {typeof rightIcon === 'string' ? (
            <Text style={{ color: rightIconColor || theme.colors.textSecondary }}>{rightIcon}</Text>
          ) : (
            rightIcon
          )}
        </View>}
      </Animated.View>
      
      {error && (
        <Text style={[styles.error, errorStyle]}>
          {error}
        </Text>
      )}
      
      {(helper || helperText) && !error && (
        <Text style={[styles.helper, helperStyle, helperTextColor ? { color: helperTextColor } : null]}>
          {helperText || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.m,
  },
  label: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.s,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.disabled,
    borderRadius: theme.radius.m,
    minHeight: 48,
    paddingHorizontal: theme.spacing.m,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.m,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.s,
  },
  errorBorder: {
    borderColor: theme.colors.error,
  },
  leftIcon: {
    marginRight: theme.spacing.s,
  },
  rightIcon: {
    marginLeft: theme.spacing.s,
  },
  error: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  helper: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});

export default OttrInput;
