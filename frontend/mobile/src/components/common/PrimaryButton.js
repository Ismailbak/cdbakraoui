import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { colors, fonts, spacing, radius } from '../../styles/theme';
import { hapticFeedback } from '../../utils/haptics';

export default function PrimaryButton({ 
  title, 
  onPress, 
  loading, 
  disabled, 
  variant = 'primary',
  style,
  icon,
  iconPosition = 'left',
  size = 'medium'
}) {
  const isOutline = variant === 'outline';
  const isPill = variant === 'pill';
  const isDanger = variant === 'danger';

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: spacing.md },
    medium: { paddingVertical: 14, paddingHorizontal: spacing.lg },
    large: { paddingVertical: 18, paddingHorizontal: spacing.xl },
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      hapticFeedback.medium();
      onPress?.();
    }
  };

  const size_style = sizeStyles[size] || sizeStyles.medium;
  const buttonBackgroundColor = isDanger ? colors.error : colors.mobilePrimary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          ...size_style,
          backgroundColor: isOutline ? 'transparent' : buttonBackgroundColor,
          borderWidth: isOutline ? 1.5 : 0,
          borderColor: isOutline ? buttonBackgroundColor : 'transparent',
        },
        isPill && styles.pill,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={isOutline ? buttonBackgroundColor : '#FFF'}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' ? (
            <Text style={{ marginRight: spacing.sm, fontSize: 18 }}>{icon}</Text>
          ) : null}
          <Text
            style={[
              styles.text,
              isOutline && { color: buttonBackgroundColor },
              isDanger && !isOutline && styles.dangerText,
            ]}
          >
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
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    flexDirection: 'row',
    borderRadius: radius.md,
  },
  pill: {
    borderRadius: radius.full,
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
  dangerText: {
    color: '#FFF',
  },
});
