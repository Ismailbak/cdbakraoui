import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../styles/theme';

/**
 * Menu item button for "More" navigation screen
 * Displays icon, label, and chevron with consistent styling
 */
export default function MoreMenuItemButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Feather 
          name={icon} 
          size={20} 
          color={colors.mobilePrimary} 
          style={styles.icon}
        />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Feather 
        name="chevron-right" 
        size={20} 
        color={colors.mobileMuted} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.mobileDivider,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: spacing.md,
  },
  label: {
    fontSize: 16,
    color: colors.mobileText,
    fontWeight: '500',
    flex: 1,
  },
});
