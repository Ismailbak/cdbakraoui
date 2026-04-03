import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, RefreshControl, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPatients } from '../../api/api';
import { colors, fonts, spacing, radius, shadows } from '../../styles/theme';

export default function PatientScreen({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const fetchData = () => {
    getPatients()
      .then((res) => setPatients(res.data))
      .catch(() => {})
      .finally(() => setRefreshing(false));
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filtered = patients.filter((p) =>
    !search || (p.name && p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const renderPatient = ({ item }) => (
    <TouchableOpacity
      style={[styles.patientCard, { padding: isSmall ? spacing.sm : spacing.md }]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{String(item.name || 'Inconnu')}</Text>
        <Text style={styles.patientDiag}>{String(item.diagnosis || 'Aucun diagnostic')}</Text>
        {item.age ? (
          <Text style={styles.patientAge}>{String(item.age) + ' ans · ' + String(item.gender || 'N/A')}</Text>
        ) : null}
      </View>
      <Text style={styles.chevron}>{'›'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={[styles.title, isSmall && { fontSize: 22 }]}>{'Patients'}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{String(filtered.length)}</Text>
        </View>
      </View>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>{'🔍'}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un patient..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPatient}
        contentContainerStyle={[styles.list, { paddingHorizontal: isSmall ? spacing.md : spacing.lg }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{'📋'}</Text>
            <Text style={styles.emptyText}>{'Aucun patient trouvé'}</Text>
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
  countBadge: { backgroundColor: colors.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  countText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  list: { paddingBottom: 100 },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  patientInfo: { flex: 1 },
  patientName: { ...fonts.subheading, fontSize: 16 },
  patientDiag: { ...fonts.caption, marginTop: 2 },
  patientAge: { ...fonts.caption, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.textMuted, fontWeight: '300' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...fonts.body },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.inputBg, borderRadius: radius.sm,
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.textPrimary },
});
