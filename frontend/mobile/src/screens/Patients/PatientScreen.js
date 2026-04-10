import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getPatients } from '../../api/api';
import { colors, fonts, spacing, radius, shadows } from '../../styles/theme';
import Input from '../../components/common/Input';

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

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
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map((n) => n[0].toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getAvatarColor = (index) => {
    const colors_palette = [colors.patient, colors.actes, colors.rdv, colors.appointmentSuccess];
    return colors_palette[index % colors_palette.length];
  };

  const filtered = patients.filter((p) =>
    !search || (p.name && p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const renderPatient = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.patientCard, { padding: isSmall ? spacing.sm : spacing.md }]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
    >
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(index) + '20' }]}>
        <Text style={[styles.avatarText, { color: getAvatarColor(index) }]}>
          {getInitials(item.name)}
        </Text>
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{String(item.name || 'Inconnu')}</Text>
        <View style={styles.patientMeta}>
          <Feather name="activity" size={12} color={colors.textMuted} />
          <Text style={[styles.patientDiag, { marginLeft: spacing.xs }]}>{String(item.diagnosis || 'Aucun diagnostic')}</Text>
        </View>
        {item.date_of_birth ? (
          <View style={styles.patientMeta}>
            <Feather name="user" size={12} color={colors.textMuted} />
            <Text style={[styles.patientAge, { marginLeft: spacing.xs }]}>{String(calculateAge(item.date_of_birth)) + ' ans · ' + String(item.gender || 'N/A')}</Text>
          </View>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, isSmall && { fontSize: 24 }]}>{'Patients'}</Text>
          <Text style={styles.subtitle}>{`${filtered.length} patient${filtered.length !== 1 ? 's' : ''}`}</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Feather name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Chercher par nom..."
          value={search}
          onChangeText={setSearch}
          icon={<Feather name="search" size={18} color={colors.textMuted} />}
          containerStyle={styles.searchInput}
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
            <Feather name="inbox" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>{'Aucun patient trouvé'}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, 
    paddingTop: spacing.lg, 
    paddingBottom: spacing.md 
  },
  title: { ...fonts.subheading, fontSize: 28, color: colors.textPrimary },
  subtitle: { ...fonts.caption, color: colors.textMuted, marginTop: spacing.xs },
  
  headerAction: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchInput: {
    marginBottom: 0,
  },

  list: { paddingBottom: 100, paddingTop: spacing.sm },
  
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  
  avatar: {
    width: 48, 
    height: 48, 
    borderRadius: radius.lg,
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontWeight: '700', fontSize: 14 },
  
  patientInfo: { flex: 1 },
  patientName: { ...fonts.subheading, fontSize: 15, color: colors.textPrimary },
  
  patientMeta: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginTop: spacing.xs 
  },
  patientDiag: { ...fonts.caption, color: colors.textMuted, flex: 1 },
  patientAge: { ...fonts.caption, color: colors.textMuted },
  
  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 60,
    paddingHorizontal: spacing.lg
  },
  emptyText: { ...fonts.body, color: colors.textMuted, marginTop: spacing.md },
});
