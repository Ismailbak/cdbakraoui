import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../styles/theme';

export default function Divider({ style, variant = 'horizontal', color = colors.divider, thickness = 1 }) {
  const isHorizontal = variant === 'horizontal';

  return (
    <View
      style={[
        isHorizontal ? styles.horizontal : styles.vertical,
        {
          backgroundColor: color,
          height: isHorizontal ? thickness : '100%',
          width: isHorizontal ? '100%' : thickness,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
  },
  vertical: {
    height: '100%',
  },
});
