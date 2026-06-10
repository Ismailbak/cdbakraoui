import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getPatient, getPatientAppointments, getPatientMedicalActs } from '../../api/api';
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
  patient?.name || `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim() || 'Patient'
);

function InfoPill({ label, value, icon }) {
  if (!value) return null;
  return (
    <View style={styles.infoPill}>
      <Feather name={icon} size={14} color={colors.mobilePrimary} />
      <View style={styles.infoPillText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>{String(value)}</Text>
      </View>
    </View>
  );
}

function SectionTitle({ title, count }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count !== undefined ? <Text style={styles.sectionCount}>{count}</Text> : null}
    </View>
  );
}

function TimelineCard({ title, subtitle, meta, icon }) {
  return (
    <View style={styles.timelineCard}>
      <View style={styles.timelineIcon}>
        <Feather name={icon} size={16} color={colors.mobilePrimary} />
      </View>
      <View style={styles.timelineBody}>
        <Text style={styles.timelineTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.timelineSubtitle} numberOfLines={2}>{subtitle}</Text> : null}
        {meta ? <Text style={styles.timelineMeta}>{meta}</Text> : null}
      </View>
    </View>
  );
}

export default function PatientDetailScreen({ route, navigation }) {
  const { patientId, patient: routePatient } = route.params || {};
  const [patient, setPatient] = useState(routePatient || null);
  const [appointments, setAppointments] = useState([]);
  const [medicalActs, setMedicalActs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(() => {
    Promise.all([
      getPatient(patientId).then((r) => setPatient(r.data)).catch(() => setPatient(routePatient || null)),
      getPatientAppointments(patientId).then((r) => setAppointments(r.data)).catch(() => setAppointments([])),
      getPatientMedicalActs(patientId).then((r) => setMedicalActs(r.data)).catch(() => setMedicalActs([])),
    ]).finally(() => setRefreshing(false));
  }, [patientId, routePatient]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const name = getPatientName(patient);
  const age = calculateAge(patient?.date_of_birth);
  const initials = useMemo(() => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(), [name]);

  if (!patient) {
    return (
      <PhoneShell scroll={false} contentStyle={styles.centerContent}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell scroll={false} contentStyle={styles.shellContent}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.mobilePrimary} />}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <Feather name="chevron-left" size={22} color={colors.mobileMuted} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Dossier patient</Text>
          <TouchableOpacity style={styles.moreButton} activeOpacity={0.75}>
            <Feather name="more-horizontal" size={20} color={colors.mobileMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.patientName}>{name}</Text>
            <Text style={styles.patientSub}>{patient.primary_diagnosis || patient.diagnosis || 'Aucun diagnostic'}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusChip}>
                <Text style={styles.statusText}>{patient.status || 'Actif'}</Text>
              </View>
              {patient.ipp ? <Text style={styles.ippText}>{patient.ipp}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <InfoPill icon="user" label="Profil" value={[age ? `${age} ans` : '', patient.gender].filter(Boolean).join(' · ')} />
          <InfoPill icon="phone" label="Téléphone" value={patient.phone} />
          <InfoPill icon="map-pin" label="Ville" value={patient.city} />
          <InfoPill icon="shield" label="Assurance" value={patient.insurance} />
          <InfoPill icon="droplet" label="Groupe" value={patient.blood_type} />
          <InfoPill icon="mail" label="Email" value={patient.email} />
        </View>

        {(patient.diagnosis || patient.notes) && (
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>Résumé clinique</Text>
            {patient.diagnosis ? <Text style={styles.noteText}>{String(patient.diagnosis)}</Text> : null}
            {patient.notes ? <Text style={styles.noteMuted}>{String(patient.notes)}</Text> : null}
          </View>
        )}

        {patient.emergency_contact_name && (
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>Contact d'urgence</Text>
            <Text style={styles.noteText}>{patient.emergency_contact_name}</Text>
            <Text style={styles.noteMuted}>{[patient.emergency_contact_relation, patient.emergency_contact_phone].filter(Boolean).join(' · ')}</Text>
          </View>
        )}

        <SectionTitle title="Actes médicaux" count={medicalActs.length} />
        {medicalActs.length > 0 ? medicalActs.slice(0, 5).map((act) => (
          <TimelineCard
            key={String(act.id)}
            icon="activity"
            title={act.act_type || 'Acte médical'}
            subtitle={act.diagnosis || act.notes}
            meta={[act.date, act.treatment].filter(Boolean).join(' · ')}
          />
        )) : <Text style={styles.emptyText}>Aucun acte médical</Text>}

        <TouchableOpacity
          style={styles.primaryOutline}
          onPress={() => navigation.navigate('AddMedicalAct', { patientId, patientName: name })}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={18} color={colors.mobilePrimary} />
          <Text style={styles.primaryOutlineText}>Nouvel acte médical</Text>
        </TouchableOpacity>

        <SectionTitle title="Rendez-vous" count={appointments.length} />
        {appointments.length > 0 ? appointments.slice(0, 5).map((apt) => (
          <TimelineCard
            key={String(apt.id)}
            icon="calendar"
            title={apt.reason || 'Rendez-vous'}
            subtitle={apt.datetime_scheduled ? new Date(apt.datetime_scheduled).toLocaleString('fr-FR') : '--'}
            meta={apt.status === 'completed' ? 'Terminé' : apt.status === 'cancelled' ? 'Annulé' : 'Planifié'}
          />
        )) : <Text style={styles.emptyText}>Aucun rendez-vous</Text>}
      </ScrollView>
    </PhoneShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 0,
  },
  content: {
    paddingBottom: 112,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...fonts.body,
    color: colors.mobileMuted,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.mobileText,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#E9F7F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileAvatarText: {
    color: colors.mobilePrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  patientName: {
    fontSize: 20,
    color: colors.mobileText,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  patientSub: {
    ...fonts.caption,
    color: colors.mobileMuted,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statusChip: {
    backgroundColor: '#E9F7F8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusText: {
    color: colors.mobilePrimary,
    fontSize: 11,
    fontWeight: '900',
  },
  ippText: {
    ...fonts.caption,
    color: colors.mobileMuted,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoPill: {
    width: '48%',
    minHeight: 64,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoPillText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: colors.mobileMuted,
    fontWeight: '800',
  },
  infoValue: {
    fontSize: 13,
    color: colors.mobileText,
    fontWeight: '800',
    marginTop: 2,
  },
  noteCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.mobileText,
    marginBottom: spacing.xs,
  },
  noteText: {
    ...fonts.bodySmall,
    color: colors.mobileText,
    fontWeight: '700',
  },
  noteMuted: {
    ...fonts.caption,
    color: colors.mobileMuted,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.mobileText,
    fontWeight: '900',
  },
  sectionCount: {
    color: colors.mobilePrimary,
    fontWeight: '900',
  },
  timelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  timelineIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E9F7F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  timelineBody: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    color: colors.mobileText,
    fontWeight: '900',
  },
  timelineSubtitle: {
    ...fonts.caption,
    color: colors.mobileMuted,
    marginTop: 2,
  },
  timelineMeta: {
    fontSize: 10,
    color: colors.mobilePrimary,
    fontWeight: '800',
    marginTop: 4,
  },
  primaryOutline: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFEAEC',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: '#F7FEFF',
  },
  primaryOutlineText: {
    color: colors.mobilePrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  emptyText: {
    ...fonts.caption,
    color: colors.mobileMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
