import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing } from '../../styles/theme';

export default function ErrorMessage({ message, variant = 'error', icon = 'alert-circle', style }) {
  const variantStyles = {
    error: { bg: colors.errorLight, text: colors.error, icon: 'alert-circle' },
    warning: { bg: colors.warningLight, text: colors.warning, icon: 'alert-triangle' },
    info: { bg: colors.primaryLight, text: colors.primary, icon: 'info' },
  };

  const style_def = variantStyles[variant] || variantStyles.error;

  return (
    <View style={[styles.container, { backgroundColor: style_def.bg }, style]}>
      <Feather name={icon || style_def.icon} size={16} color={style_def.text} />
      <Text style={[styles.message, { color: style_def.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  message: {
    ...fonts.bodySmall,
    marginLeft: spacing.md,
    flex: 1,
  },
});
