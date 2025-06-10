/**
 * TypingIndicator Component
 * 
 * Displays an animated typing indicator when the other user is typing.
 * Features animated dots and username display.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  cancelAnimation,
  Easing
} from 'react-native-reanimated';
import OttrText from '../common/OttrText';
import theme from '../../constants/theme';

interface TypingIndicatorProps {
  username: string;
}

/**
 * TypingIndicator Component
 */
const TypingIndicator: React.FC<TypingIndicatorProps> = ({ username }) => {
  // Animation values for each dot
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);
  
  // Animated styles
  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
    transform: [{ scale: dot1Opacity.value + 0.5 }],
  }));
  
  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
    transform: [{ scale: dot2Opacity.value + 0.5 }],
  }));
  
  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
    transform: [{ scale: dot3Opacity.value + 0.5 }],
  }));
  
  // Start the animations when the component mounts
  useEffect(() => {
    // Animate the dots in sequence
    dot1Opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.ease }),
        withTiming(0.3, { duration: 400, easing: Easing.ease })
      ),
      -1 // Infinite repeat
    );
    
    // Delay the second dot animation slightly
    setTimeout(() => {
      dot2Opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.ease }),
          withTiming(0.3, { duration: 400, easing: Easing.ease })
        ),
        -1
      );
    }, 150);
    
    // Delay the third dot animation slightly more
    setTimeout(() => {
      dot3Opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.ease }),
          withTiming(0.3, { duration: 400, easing: Easing.ease })
        ),
        -1
      );
    }, 300);
    
    // Clean up animations when component unmounts
    return () => {
      cancelAnimation(dot1Opacity);
      cancelAnimation(dot2Opacity);
      cancelAnimation(dot3Opacity);
    };
  }, []);
  
  return (
    <View style={styles.container}>
      <OttrText variant="caption" color={theme.colors.textSecondary} style={styles.text}>
        {username} is typing
      </OttrText>
      
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, dot1Style]} />
        <Animated.View style={[styles.dot, dot2Style]} />
        <Animated.View style={[styles.dot, dot3Style]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  text: {
    marginRight: theme.spacing.s,
    fontSize: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
    marginHorizontal: 2,
  },
});

export default TypingIndicator;
