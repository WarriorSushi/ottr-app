/**
 * OttrText Component
 * 
 * A customizable text component for the Ottr app with typography variants.
 */

import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import theme from '../../constants/theme';

// Text variants
export type TextVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'body' 
  | 'bodySmall' 
  | 'caption' 
  | 'button';

// Text weights
export type TextWeight = 'regular' | 'medium' | 'bold';

// Text props interface
export interface OttrTextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  weight?: TextWeight;
  color?: string;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
}

/**
 * OttrText Component
 */
const OttrText: React.FC<OttrTextProps> = ({
  children,
  variant = 'body',
  weight = 'regular',
  color,
  center = false,
  style,
  numberOfLines,
  onPress,
  accessibilityLabel,
}) => {
  // Get text styles based on variant and weight
  const getTextStyles = (): StyleProp<TextStyle> => {
    const variantStyles = {
      h1: {
        fontSize: theme.typography.fontSize.xxl,
        lineHeight: theme.typography.lineHeight.xxl,
      },
      h2: {
        fontSize: theme.typography.fontSize.xl,
        lineHeight: theme.typography.lineHeight.xl,
      },
      h3: {
        fontSize: theme.typography.fontSize.l,
        lineHeight: theme.typography.lineHeight.l,
      },
      body: {
        fontSize: theme.typography.fontSize.m,
        lineHeight: theme.typography.lineHeight.m,
      },
      bodySmall: {
        fontSize: theme.typography.fontSize.s,
        lineHeight: theme.typography.lineHeight.s,
      },
      caption: {
        fontSize: theme.typography.fontSize.xs,
        lineHeight: theme.typography.lineHeight.xs,
      },
      button: {
        fontSize: theme.typography.fontSize.m,
        lineHeight: theme.typography.lineHeight.m,
      },
    };

    const weightStyles = {
      regular: {
        fontFamily: theme.typography.fontFamily.regular,
      },
      medium: {
        fontFamily: theme.typography.fontFamily.medium,
      },
      bold: {
        fontFamily: theme.typography.fontFamily.bold,
      },
    };

    const colorStyle = color ? { color } : { color: theme.colors.textPrimary };
    const alignmentStyle = center ? { textAlign: 'center' as 'center' } : {};

    return [
      styles.text,
      variantStyles[variant],
      weightStyles[weight],
      colorStyle,
      alignmentStyle,
      style,
    ];
  };

  return (
    <Text
      style={getTextStyles()}
      numberOfLines={numberOfLines}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={onPress ? 'button' : 'text'}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    color: theme.colors.textPrimary,
  },
});

export default OttrText;
