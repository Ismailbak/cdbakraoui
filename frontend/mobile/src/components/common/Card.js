import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing, shadows, radius } from '../../styles/theme';

export default function Card({ title, value, subtitle, icon, accentColor, children, style }) {
  const accent = accentColor || colors.primary;

  const hasHeader = Boolean(title) || value !== undefined;

  return (
    <View style={[styles.card, style]}>
      {hasHeader ? (
        <View style={styles.header}>
          {icon ? (
            <View style={[styles.iconWrap, { backgroundColor: accent + '15' }]}>
              <Text style={[styles.iconText, { color: accent }]}>{icon}</Text>
            </View>
          ) : null}
          <View style={styles.headerText}>
            {title ? <Text style={styles.label}>{title}</Text> : null}
            {value !== undefined ? <Text style={styles.value}>{String(value)}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  label: {
    ...fonts.label,
    marginBottom: 2,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    ...fonts.caption,
    marginTop: 2,
  },
});
