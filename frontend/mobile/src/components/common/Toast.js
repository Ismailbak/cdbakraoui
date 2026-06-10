import React, { useRef, useEffect } from 'react';
import { Animated, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing } from '../../styles/theme';

export default function Toast({ message, type = 'info', visible = false, duration = 3000, onDismiss }) {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onDismiss && onDismiss());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, slideAnim, duration, onDismiss]);

  if (!visible) return null;

  const typeStyles = {
    success: { bg: colors.successLight, text: colors.success, icon: 'check-circle' },
    error: { bg: colors.errorLight, text: colors.error, icon: 'alert-circle' },
    warning: { bg: colors.warningLight, text: colors.warning, icon: 'alert-triangle' },
    info: { bg: colors.primaryLight, text: colors.primary, icon: 'info' },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: style.bg,
        },
      ]}
    >
      <View style={styles.content}>
        <Feather name={style.icon} size={20} color={style.text} />
        <Text style={[styles.message, { color: style.text }]}>{message}</Text>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss}>
          <Feather name="x" size={18} color={style.text} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    ...fonts.body,
    marginLeft: spacing.md,
    flex: 1,
  },
});
