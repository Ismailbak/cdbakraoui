import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing } from '../../styles/theme';

export default function EmptyState({ 
  icon = 'inbox', 
  title = 'No Data', 
  description = 'There\'s nothing to show here yet', 
  actionLabel = null,
  onAction = null,
  style 
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Feather name={icon} size={48} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Text style={styles.action} onPress={onAction}>
          {actionLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...fonts.subheading,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  action: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
