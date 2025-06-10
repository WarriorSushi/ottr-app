/**
 * OttrCard Component
 * 
 * A customizable card component for the Ottr app with white surface and warm shadows.
 */

import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle, 
  StyleProp, 
  TouchableOpacity,
  Platform
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import theme from '../../constants/theme';

// Animated TouchableOpacity
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Card props interface
export interface OttrCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: 'none' | 'light' | 'medium' | 'strong';
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'small' | 'medium' | 'large';
  animated?: boolean;
  accessibilityLabel?: string;
}

/**
 * OttrCard Component
 */
const OttrCard: React.FC<OttrCardProps> = ({
  children,
  style,
  onPress,
  elevation = 'medium',
  padding = 'medium',
  borderRadius = 'medium',
  animated = false,
  accessibilityLabel,
}) => {
  // Animation value for press effect
  const scale = useSharedValue(1);

  // Handle press in animation
  const handlePressIn = () => {
    if (animated && onPress) {
      scale.value = withSpring(0.98, {
        damping: 15,
        stiffness: 150,
      });
    }
  };

  // Handle press out animation
  const handlePressOut = () => {
    if (animated && onPress) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Get shadow styles based on elevation
  const getShadowStyles = (): StyleProp<ViewStyle> => {
    const shadowStyles = {
      none: {},
      light: theme.shadow.light,
      medium: theme.shadow.medium,
      strong: theme.shadow.strong,
    };

    return shadowStyles[elevation];
  };

  // Get padding styles based on padding prop
  const getPaddingStyles = (): StyleProp<ViewStyle> => {
    const paddingStyles = {
      none: { padding: 0 },
      small: { padding: theme.spacing.s },
      medium: { padding: theme.spacing.m },
      large: { padding: theme.spacing.l },
    };

    return paddingStyles[padding];
  };

  // Get border radius styles based on borderRadius prop
  const getBorderRadiusStyles = (): StyleProp<ViewStyle> => {
    const borderRadiusStyles = {
      small: { borderRadius: theme.radius.s },
      medium: { borderRadius: theme.radius.m },
      large: { borderRadius: theme.radius.l },
    };

    return borderRadiusStyles[borderRadius];
  };

  // Combine all styles
  const cardStyles = [
    styles.card,
    getShadowStyles(),
    getPaddingStyles(),
    getBorderRadiusStyles(),
    style,
  ];

  // If there's no onPress handler, render a simple View
  if (!onPress) {
    return (
      <View style={cardStyles}>
        {children}
      </View>
    );
  }

  // If there's an onPress handler, render a TouchableOpacity
  return (
    <AnimatedTouchable
      style={[cardStyles, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
});

export default OttrCard;
