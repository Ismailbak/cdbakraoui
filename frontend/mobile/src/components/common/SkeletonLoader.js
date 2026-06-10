import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../styles/theme';

export default function SkeletonLoader({ width = '100%', height = 20, style, count = 1 }) {
  const shimmerAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: false }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.skeleton,
            {
              width,
              height,
              opacity,
              marginBottom: i < count - 1 ? 12 : 0,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.divider,
    borderRadius: 8,
  },
});
