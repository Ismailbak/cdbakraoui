import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, shadows } from '../../styles/theme';

export default function BottomSheet({ 
  visible = false,
  onClose = () => {},
  title = '',
  description = '',
  actions = [], // [{ label: 'Action', onPress: () => {}, variant: 'primary' }]
  children = null,
  height = 'auto'
}) {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  if (!visible) return null;

  return (
    <Modal 
      visible={visible} 
      transparent={true} 
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Description */}
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}

          {/* Children / Content */}
          {children && <View style={styles.content}>{children}</View>}

          {/* Actions */}
          {actions.length > 0 && (
            <View style={styles.actions}>
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.action,
                    action.variant === 'danger' && styles.actionDanger,
                    index > 0 && styles.actionSpacing,
                  ]}
                  onPress={() => {
                    action.onPress?.();
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.actionText,
                      action.variant === 'danger' && styles.actionTextDanger,
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    minHeight: 200,
    ...shadows.card,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...fonts.subheading,
    flex: 1,
  },
  description: {
    ...fonts.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  content: {
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'column',
  },
  action: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  actionDanger: {
    backgroundColor: colors.error,
  },
  actionSpacing: {
    marginTop: spacing.md,
  },
  actionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionTextDanger: {
    color: '#FFF',
  },
});
