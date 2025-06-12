import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { withTiming, useSharedValue, useAnimatedStyle, withRepeat } from 'react-native-reanimated';
import theme from '../../constants/theme';
import animations from '../../constants/animations';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 14, borderRadius = 4, style }) => {
  const opacity = useSharedValue(0.3);

  opacity.value = withRepeat(withTiming(1, {
    duration: animations.DURATIONS.SLOW,
    easing: animations.EASINGS.IN_OUT,
  }), -1, true);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.skeleton, { width, height, borderRadius }, animatedStyle, style]} />;
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.surfaceSecondary,
  },
});

export default Skeleton;
