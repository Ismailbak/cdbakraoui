import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { colors, fonts, spacing, radius } from '../../styles/theme';

export default function PrimaryButton({ 
  title, 
  onPress, 
  loading, 
  disabled, 
  variant, 
  style,
  icon,
  iconPosition = 'left'
}) {
  const isOutline = variant === 'outline';
  const isPill = variant === 'pill';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isOutline && styles.outline,
        isPill && styles.pill,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={isOutline ? colors.primary : '#FFF'} 
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' ? (
            <Text style={{ marginRight: spacing.sm, fontSize: 18 }}>{icon}</Text>
          ) : null}
          <Text style={[styles.text, isOutline && styles.outlineText, isPill && styles.pillText]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' ? (
            <Text style={{ marginLeft: spacing.sm, fontSize: 18 }}>{icon}</Text>
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    flexDirection: 'row',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  pill: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  outlineText: {
    color: colors.primary,
  },
  pillText: {
    color: '#FFF',
  },
});
