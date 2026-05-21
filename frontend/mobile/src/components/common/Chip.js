import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing } from '../../styles/theme';

export default function Chip({ 
  label, 
  onPress, 
  onDelete, 
  variant = 'default',
  icon = null,
  size = 'medium',
  style 
}) {
  const variantStyles = {
    default: { bg: colors.divider, text: colors.textPrimary },
    primary: { bg: colors.primaryLight, text: colors.primary },
    success: { bg: colors.successLight, text: colors.success },
    warning: { bg: colors.warningLight, text: colors.warning },
    error: { bg: colors.errorLight, text: colors.error },
  };

  const sizeStyles = {
    small: { paddingHorizontal: 10, paddingVertical: 4, fontSize: 12 },
    medium: { paddingHorizontal: 14, paddingVertical: 6, fontSize: 13 },
    large: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 14 },
  };

  const variant_style = variantStyles[variant] || variantStyles.default;
  const size_style = sizeStyles[size] || sizeStyles.medium;

  const content = (
    <View style={[styles.chip, { backgroundColor: variant_style.bg }, style]}>
      {icon && <Feather name={icon} size={14} color={variant_style.text} style={styles.icon} />}
      <Text style={[styles.label, { color: variant_style.text, fontSize: size_style.fontSize }]}>
        {label}
      </Text>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteIcon}>
          <Feather name="x" size={14} color={variant_style.text} />
        </TouchableOpacity>
      )}
    </View>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  ) : (
    content
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    fontWeight: '500',
  },
  deleteIcon: {
    marginLeft: spacing.xs,
  },
});
