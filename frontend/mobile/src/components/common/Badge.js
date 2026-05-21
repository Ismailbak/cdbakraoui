import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/theme';

export default function Badge({ label, variant = 'primary', size = 'medium', style }) {
  const badgeVariants = {
    primary: { bg: colors.primaryLight, text: colors.primary },
    success: { bg: colors.successLight, text: colors.success },
    warning: { bg: colors.warningLight, text: colors.warning },
    error: { bg: colors.errorLight, text: colors.error },
    actes: { bg: colors.actesLight, text: colors.actes },
    patient: { bg: colors.patientLight, text: colors.patient },
    rdv: { bg: colors.rdvLight, text: colors.rdv },
    appointment: { bg: colors.appointmentSuccessLight, text: colors.appointmentSuccess },
  };

  const sizeStyles = {
    small: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 11 },
    medium: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 12 },
    large: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 13 },
  };

  const variant_style = badgeVariants[variant] || badgeVariants.primary;
  const size_style = sizeStyles[size] || sizeStyles.medium;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variant_style.bg,
          paddingHorizontal: size_style.paddingHorizontal,
          paddingVertical: size_style.paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: variant_style.text,
            fontSize: size_style.fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
