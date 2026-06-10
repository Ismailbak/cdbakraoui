import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../../styles/theme';

export default function Input({
  label,
  error,
  containerStyle,
  icon: IconComponent,
  isValid = false,
  onIconPress = null,
  disabled = false,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          isValid && !error && styles.inputWrapperValid,
          disabled && styles.inputWrapperDisabled,
        ]}
      >
        {IconComponent && (
          <View style={styles.iconContainer}>
            {IconComponent}
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            IconComponent && styles.inputWithIcon,
            focused && styles.inputFocused,
            error && styles.inputError,
            isValid && !error && styles.inputValid,
            disabled && styles.inputDisabled,
          ]}
          placeholderTextColor={colors.textMutedLight}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={!disabled}
          {...props}
        />
        {/* Validation Icon */}
        {isValid && !error && (
          <View style={styles.validationIcon}>
            <Feather name="check-circle" size={18} color={colors.success} />
          </View>
        )}
        {/* Error Icon */}
        {error && (
          <TouchableOpacity
            style={styles.validationIcon}
            onPress={onIconPress}
            disabled={!onIconPress}
          >
            <Feather name="alert-circle" size={18} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...fonts.label,
    marginBottom: spacing.sm,
    color: colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  inputWrapperFocused: {
    borderColor: colors.mobilePrimary,
    backgroundColor: colors.surface,
  },
  inputWrapperError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  inputWrapperValid: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  inputWrapperDisabled: {
    backgroundColor: colors.divider,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    color: colors.mobileText,
  },
  inputWithIcon: {
    paddingLeft: spacing.sm,
  },
  inputFocused: {
    color: colors.textPrimary,
  },
  inputError: {
    color: colors.error,
  },
  inputValid: {
    color: colors.success,
  },
  inputDisabled: {
    color: colors.textMuted,
  },
  iconContainer: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validationIcon: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});
