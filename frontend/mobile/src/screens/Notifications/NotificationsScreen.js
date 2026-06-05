import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getNotifications } from '../../api/api';
import { colors, fonts, spacing, radius } from '../../styles/theme';
import PhoneShell, { ScreenHeader } from '../../components/common/PhoneShell';

const CATEGORY_MAP = {
  urgent: { bg: colors.errorLight, clr: colors.error, icon: 'alert-triangle' },
  message: { bg: '#E9F7F8', clr: colors.mobilePrimary, icon: 'message-circle' },
  info: { bg: '#E9F7F8', clr: colors.mobilePrimary, icon: 'info' },
  alert: { bg: '#FFF4DE', clr: colors.warning, icon: 'bell' },
};

function getCatStyle(category) {
  return CATEGORY_MAP[category] || CATEGORY_MAP.message;
}

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    getNotifications()
      .then((res) => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch(() => setNotifications([]))
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
          <Feather name={cat.icon} size={19} color={cat.clr} />
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
    <PhoneShell scroll={false} contentStyle={styles.shellContent}>
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />

      <View style={styles.heroCard}>
        <View>
          <Text style={styles.heroEyebrow}>Boîte d'alertes</Text>
          <Text style={styles.heroTitle}>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</Text>
          <Text style={styles.heroSubtitle}>Messages importants, rappels RDV et informations du cabinet.</Text>
        </View>
        <View style={styles.heroIcon}>
          <Feather name="bell" size={24} color={colors.surface} />
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderNotification}
        style={styles.listView}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.mobilePrimary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="bell" size={42} color={colors.mobileMuted} />
            <Text style={styles.emptyText}>{'Aucune notification'}</Text>
          </View>
        }
      />
    </PhoneShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 0,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.mobileBackground,
    borderRadius: 22,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroEyebrow: {
    color: '#BFE4E7',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  heroSubtitle: {
    color: '#D6ECEE',
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
    maxWidth: 210,
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: colors.mobilePrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listView: { flex: 1 },
  list: { paddingBottom: 112 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  unread: {
    borderWidth: 1,
    borderColor: '#BFE4E7',
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  notifTitle: { color: colors.mobileText, fontSize: 15, fontWeight: '900', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.mobilePrimary, marginLeft: spacing.sm },
  notifMessage: { ...fonts.caption, color: colors.mobileMuted, lineHeight: 18 },
  sender: { ...fonts.caption, marginTop: 6, color: colors.mobilePrimary, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { ...fonts.body, color: colors.mobileMuted, marginTop: spacing.md },
});
