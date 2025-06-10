/**
 * Ottr Design System
 * 
 * This file contains the design system for the Ottr exclusive messaging app,
 * featuring the Peach Fuzz color palette and consistent design tokens.
 */

import { Platform } from 'react-native';

// Type definitions for the theme
export interface ThemeColors {
  primary: string;
  accent: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  error: string;
  success: string;
  disabled: string;
}

export interface ThemeSpacing {
  xs: number;
  s: number;
  m: number;
  l: number;
  xl: number;
  xxl: number;
}

export interface ThemeRadius {
  s: number;
  m: number;
  l: number;
}

export interface ThemeShadow {
  light: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  medium: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  strong: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface ThemeTypography {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };
  fontSize: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  lineHeight: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
}

export interface ThemeAnimations {
  timing: {
    fast: number;
    normal: number;
    slow: number;
  };
  spring: {
    gentle: {
      damping: number;
      stiffness: number;
      mass: number;
    };
    responsive: {
      damping: number;
      stiffness: number;
      mass: number;
    };
    bouncy: {
      damping: number;
      stiffness: number;
      mass: number;
    };
  };
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  shadow: ThemeShadow;
  typography: ThemeTypography;
  animations: ThemeAnimations;
}

// Peach Fuzz color palette
export const colors: ThemeColors = {
  primary: '#FFBE98', // Peach Fuzz
  accent: '#FF8A80', // Soft Coral
  secondary: '#FFB74D', // Warm Orange
  background: '#FFF8F3', // Cream White
  surface: '#FFFFFF', // Pure White
  surfaceSecondary: '#FFF0E8', // Light Peach Surface
  textPrimary: '#2E2E2E', // Deep Charcoal
  textSecondary: '#8D7A6B', // Warm Gray
  error: '#FF5252', // Error Red
  success: '#4CAF50', // Success Green
  disabled: '#E0E0E0', // Disabled Gray
};

// Spacing scale
export const spacing: ThemeSpacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const radius: ThemeRadius = {
  s: 8,
  m: 12,
  l: 16,
};

// Shadow definitions with warm tones
export const shadow: ThemeShadow = {
  light: {
    shadowColor: '#FFBE98',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#FFBE98',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  strong: {
    shadowColor: '#FFBE98',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Typography with Inter font
export const typography: ThemeTypography = {
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'Inter-Regular' : 'Inter',
    medium: Platform.OS === 'ios' ? 'Inter-Medium' : 'Inter-Medium',
    bold: Platform.OS === 'ios' ? 'Inter-Bold' : 'Inter-Bold',
  },
  fontSize: {
    xs: 12,
    s: 14,
    m: 16,
    l: 18,
    xl: 20,
    xxl: 24,
  },
  lineHeight: {
    xs: 16,
    s: 20,
    m: 24,
    l: 28,
    xl: 32,
    xxl: 36,
  },
};

// Animation timings and spring configurations
export const animations: ThemeAnimations = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  spring: {
    gentle: {
      damping: 15,
      stiffness: 100,
      mass: 1,
    },
    responsive: {
      damping: 20,
      stiffness: 180,
      mass: 1,
    },
    bouncy: {
      damping: 10,
      stiffness: 150,
      mass: 1,
    },
  },
};

// Export the complete theme
export const theme: Theme = {
  colors,
  spacing,
  radius,
  shadow,
  typography,
  animations,
};

export default theme;
