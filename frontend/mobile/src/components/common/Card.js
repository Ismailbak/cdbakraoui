import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, shadows, radius } from '../../styles/theme';

export default function Card({ 
  title, 
  value, 
  subtitle, 
  icon, 
  accentColor, 
  children, 
  style, 
  isGradient,
  onPress,
  gradientStart,
  gradientEnd 
}) {
  const accent = accentColor || colors.primary;
  const hasHeader = Boolean(title) || value !== undefined;
  
  const cardContent = (
    <>
      {hasHeader ? (
        <View style={styles.header}>
          {icon ? (
            <View style={[styles.iconWrap, { backgroundColor: accent + '20' }]}>
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
    </>
  );

  // Use gradient for AI assistant card or custom gradient
  if (isGradient) {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.85}>
        <LinearGradient
          colors={[gradientStart || colors.aiGradientStart, gradientEnd || colors.aiGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cardGradient, style, shadows.card]}
        >
          {cardContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.85}>
      <View style={[styles.card, style, shadows.card]}>
        {cardContent}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cardGradient: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
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
    fontSize: 24,
    fontWeight: '600',
  },
  headerText: {
    flex: 1,
  },
  label: {
    ...fonts.label,
    marginBottom: spacing.xs,
    color: colors.textMuted,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    ...fonts.caption,
    marginTop: spacing.xs,
    color: colors.textMutedLight,
  },
});
