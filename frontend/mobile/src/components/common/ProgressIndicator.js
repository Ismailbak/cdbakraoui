import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../styles/theme';

export default function ProgressIndicator({ current = 0, total = 3, style }) {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.step,
            {
              backgroundColor: i < current ? colors.primary : colors.divider,
            },
          ]}
        />
      ))}
      <Text style={styles.label}>
        Step {current} of {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  step: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  label: {
    ...fonts.caption,
    marginTop: spacing.sm,
  },
});
