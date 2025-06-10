/**
 * Ottr Animation Constants
 * 
 * This file contains reusable animation configurations for the Ottr app.
 * These are used with React Native Reanimated for smooth 60fps animations.
 */

import { Easing } from 'react-native-reanimated';

// Animation durations
export const DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

// Easing functions
export const EASINGS = {
  // Standard easing functions
  IN_OUT: Easing.inOut(Easing.ease),
  OUT: Easing.out(Easing.ease),
  IN: Easing.in(Easing.ease),
  
  // Custom easing functions
  BOUNCE_OUT: Easing.bezier(0.34, 1.56, 0.64, 1),
  SOFT_IN_OUT: Easing.bezier(0.4, 0.0, 0.2, 1),
};

// Spring configurations
export const SPRINGS = {
  // Gentle spring for subtle animations
  GENTLE: {
    damping: 15,
    mass: 1,
    stiffness: 100,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  
  // Responsive spring for UI feedback
  RESPONSIVE: {
    damping: 20,
    mass: 1,
    stiffness: 180,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  
  // Bouncy spring for playful animations
  BOUNCY: {
    damping: 10,
    mass: 1,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

// Common animation variants
export const VARIANTS = {
  // Fade in animation
  FADE_IN: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: DURATIONS.NORMAL,
    easing: EASINGS.IN_OUT,
  },
  
  // Slide up animation
  SLIDE_UP: {
    from: { opacity: 0, translateY: 20 },
    to: { opacity: 1, translateY: 0 },
    duration: DURATIONS.NORMAL,
    easing: EASINGS.OUT,
  },
  
  // Scale animation for buttons
  BUTTON_PRESS: {
    from: { scale: 1 },
    to: { scale: 0.96 },
    duration: DURATIONS.FAST,
    easing: EASINGS.OUT,
  },
  
  // Message bubble animation
  MESSAGE_BUBBLE: {
    from: { opacity: 0, translateY: 10, scale: 0.95 },
    to: { opacity: 1, translateY: 0, scale: 1 },
    duration: DURATIONS.NORMAL,
    easing: EASINGS.OUT,
  },
};

export default {
  DURATIONS,
  EASINGS,
  SPRINGS,
  VARIANTS,
};
