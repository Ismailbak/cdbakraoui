import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getPatients } from '../../api/api';
import { colors, fonts, spacing, radius } from '../../styles/theme';
import PhoneShell from '../../components/common/PhoneShell';

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const getPatientName = (patient) => (
  patient.name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Patient'
);

function PatientCard({ patient, onPress }) {
  const age = calculateAge(patient.date_of_birth);
  const name = getPatientName(patient);

  return (
    <TouchableOpacity style={styles.patientCard} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName} numberOfLines={1}>{name}</Text>
        <Text style={styles.patientDiagnosis} numberOfLines={1}>{patient.primary_diagnosis || patient.diagnosis || 'Aucun diagnostic'}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{age ? `${age} ans` : 'Âge inconnu'}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>{patient.gender || 'N/A'}</Text>
          {patient.ipp ? <View style={styles.metaDot} /> : null}
          {patient.ipp ? <Text style={styles.metaText}>{patient.ipp}</Text> : null}
        </View>
      </View>
      <View style={styles.chevronBox}>
        <Feather name="chevron-right" size={18} color={colors.mobilePrimary} />
      </View>
    </TouchableOpacity>
  );
}

export default function PatientScreen({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = () => {
    getPatients()
      .then((res) => setPatients(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPatients([]))
      .finally(() => setRefreshing(false));
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filtered = useMemo(() => patients.filter((p) => {
    const haystack = `${getPatientName(p)} ${p.primary_diagnosis || ''} ${p.ipp || ''}`.toLowerCase();
    return !search || haystack.includes(search.toLowerCase());
  }), [patients, search]);

  return (
    <PhoneShell scroll={false} contentStyle={styles.shellContent}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Patients</Text>
          <Text style={styles.subtitle}>{filtered.length} dossier{filtered.length > 1 ? 's' : ''} patient</Text>
        </View>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
          <Feather name="plus" size={22} color={colors.surface} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Feather name="search" size={18} color={colors.mobileMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Chercher un patient..."
          placeholderTextColor={colors.mobileMuted}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PatientCard
            patient={item}
            onPress={() => navigation.navigate('PatientDetail', { patientId: item.id, patient: item })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.mobilePrimary} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={42} color={colors.mobileMuted} />
            <Text style={styles.emptyTitle}>Aucun patient trouvé</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.mobileText,
    letterSpacing: -0.6,
  },
  subtitle: {
    ...fonts.caption,
    color: colors.mobileMuted,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.mobileBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: colors.mobileText,
    fontSize: 14,
  },
  list: {
    paddingBottom: 112,
    gap: spacing.sm,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#E9F7F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.mobilePrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    color: colors.mobileText,
    fontWeight: '900',
  },
  patientDiagnosis: {
    ...fonts.caption,
    color: colors.mobileMuted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  metaText: {
    fontSize: 10,
    color: colors.mobileMuted,
    fontWeight: '700',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.mobileMuted,
    marginHorizontal: 6,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E9F7F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyTitle: {
    ...fonts.body,
    color: colors.mobileMuted,
    marginTop: spacing.md,
  },
});
