import React, { useState } from 'react';
import { StyleProp, ImageStyle } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import theme from '../../constants/theme';

interface FadeInImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

/**
 * FadeInImage
 *
 * Lightweight component for progressive image loading.
 * Shows a blurred placeholder with Peach Fuzz secondary color while the
 * image loads, then fades in the final image.
 */
const FadeInImage: React.FC<FadeInImageProps> = ({ uri, style, resizeMode = 'cover' }) => {
  const [loaded, setLoaded] = useState(false);
  const opacity = useSharedValue(0);

  const onLoad = () => {
    setLoaded(true);
    opacity.value = withTiming(1, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <>
      {!loaded && (
        <Animated.View
          style={[{
            backgroundColor: theme.colors.secondary, // Peach fuzz secondary
          }, style]}
        />
      )}
      <Animated.Image
        source={{ uri }}
        resizeMode={resizeMode}
        onLoad={onLoad}
        style={[style, animatedStyle]}
        blurRadius={loaded ? 0 : 2}
      />
    </>
  );
};

export default FadeInImage;
