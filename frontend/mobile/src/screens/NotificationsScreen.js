import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNotifications } from '../api/api';
import { colors, fonts, spacing, radius, shadows } from '../styles/theme';

const CATEGORY_MAP = {
  urgent: { bg: '#E53E3E15', clr: '#E53E3E', icon: '🚨' },
  message: { bg: '#0A66C215', clr: '#0A66C2', icon: '💬' },
  info: { bg: '#00B4D815', clr: '#00B4D8', icon: 'ℹ️' },
  alert: { bg: '#ED893615', clr: '#ED8936', icon: '⚠️' },
};

function getCatStyle(category) {
  return CATEGORY_MAP[category] || CATEGORY_MAP.message;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const fetchData = () => {
    getNotifications()
      .then((res) => setNotifications(res.data))
      .catch(() => {})
      .finally(() => setRefreshing(false));
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = ({ item }) => {
    const cat = getCatStyle(item.category);
    return (
      <TouchableOpacity style={[styles.notifCard, !item.read && styles.unread]} activeOpacity={0.7}>
        <View style={[styles.iconWrap, { backgroundColor: cat.bg }]}>
          <Text style={styles.iconText}>{cat.icon}</Text>
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={styles.notifTitle} numberOfLines={1}>{String(item.title || '')}</Text>
            {!item.read ? <View style={styles.unreadDot} /> : null}
          </View>
          <Text style={styles.notifMessage} numberOfLines={2}>{String(item.message || '')}</Text>
          {item.sender_name ? (
            <Text style={styles.sender}>{'De: ' + String(item.sender_name)}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={[styles.title, isSmall && { fontSize: 22 }]}>{'Notifications'}</Text>
        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{String(unreadCount)}</Text>
          </View>
        ) : null}
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderNotification}
        contentContainerStyle={[styles.list, { paddingHorizontal: isSmall ? spacing.md : spacing.lg }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{'🔔'}</Text>
            <Text style={styles.emptyText}>{'Aucune notification'}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { ...fonts.heading, flex: 1 },
  badge: { backgroundColor: colors.error, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  badgeText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  list: { paddingBottom: 100 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: radius.sm,
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  iconText: { fontSize: 18 },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  notifTitle: { ...fonts.subheading, fontSize: 15, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: spacing.sm },
  notifMessage: { ...fonts.caption, lineHeight: 18 },
  sender: { ...fonts.caption, marginTop: 4, color: colors.primary, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...fonts.body },
});
