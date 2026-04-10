import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Alert, useWindowDimensions, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getPatient, getPatientAppointments, getPatientMedicalActs,
  getPatientDossierPdf,
} from '../../api/api';
import { colors, fonts, spacing, radius, shadows } from '../../styles/theme';
import Card from '../../components/common/Card';
import PrimaryButton from '../../components/common/PrimaryButton';

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

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{String(value)}</Text>
      </View>
    </View>
  );
}

function SectionTitle({ icon, title, count }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count !== undefined && (
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{String(count)}</Text>
        </View>
      )}
    </View>
  );
}

export default function PatientDetailScreen({ route, navigation }) {
  const { patientId } = route.params;
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalActs, setMedicalActs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const fetchAll = useCallback(() => {
    Promise.all([
      getPatient(patientId).then((r) => setPatient(r.data)).catch(() => {}),
      getPatientAppointments(patientId).then((r) => setAppointments(r.data)).catch(() => {}),
      getPatientMedicalActs(patientId).then((r) => setMedicalActs(r.data)).catch(() => {}),
    ]).finally(() => setRefreshing(false));
  }, [patientId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      Alert.alert(
        'Exporter Dossier',
        'Le dossier PDF sera téléchargé depuis le serveur. Ouvrir dans le navigateur ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Ouvrir',
            onPress: () => {
              const baseUrl = 'http://192.168.1.199:8000/api';
              Linking.openURL(`${baseUrl}/patients/${patientId}/dossier`);
            },
          },
        ],
      );
    } catch {
      Alert.alert('Erreur', "Impossible d'exporter le dossier.");
    } finally {
      setExportingPdf(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!patient) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{'Chargement...'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.content, { padding: isSmall ? spacing.md : spacing.lg }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'← Retour'}</Text>
        </TouchableOpacity>

        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{getInitials(patient.name)}</Text>
          </View>
          <Text style={styles.patientName}>{String(patient.name)}</Text>
          <Text style={styles.patientSub}>
            {(patient.date_of_birth ? calculateAge(patient.date_of_birth) + ' ans' : '') +
              (patient.gender ? ' · ' + patient.gender : '') +
              (patient.ipp ? ' · IPP: ' + patient.ipp : '')}
          </Text>
          {patient.status && (
            <View style={[
              styles.statusChip,
              { backgroundColor: patient.status === 'Actif' ? colors.success + '15' : colors.warning + '15' },
            ]}>
              <Text style={[
                styles.statusChipText,
                { color: patient.status === 'Actif' ? colors.success : colors.warning },
              ]}>
                {String(patient.status)}
              </Text>
            </View>
          )}
        </View>

        {/* Contact Info */}
        <Card title="Informations" icon="📋" accentColor={colors.primary}>
          <View style={styles.infoGrid}>
            <InfoRow icon="📞" label="Téléphone" value={patient.phone} />
            <InfoRow icon="📧" label="Email" value={patient.email} />
            <InfoRow icon="📍" label="Adresse" value={patient.address} />
            <InfoRow icon="🏙️" label="Ville" value={patient.city} />
            <InfoRow icon="🏥" label="Assurance" value={patient.insurance} />
            <InfoRow icon="🩸" label="Groupe Sanguin" value={patient.blood_type} />
            <InfoRow icon="⚠️" label="Allergies" value={patient.allergies} />
            <InfoRow icon="🎂" label="Date de Naissance" value={patient.date_of_birth} />
          </View>
        </Card>

        {/* Emergency Contact */}
        {patient.emergency_contact_name && (
          <Card title="Contact d'Urgence" icon="🚨" accentColor={colors.error}>
            <View style={styles.infoGrid}>
              <InfoRow icon="👤" label="Nom" value={patient.emergency_contact_name} />
              <InfoRow icon="🔗" label="Relation" value={patient.emergency_contact_relation} />
              <InfoRow icon="📞" label="Téléphone" value={patient.emergency_contact_phone} />
            </View>
          </Card>
        )}

        {/* Diagnosis & Notes */}
        {(patient.diagnosis || patient.notes) && (
          <Card title="Diagnostic & Notes" icon="🩺" accentColor={colors.warning}>
            {patient.diagnosis && (
              <View style={styles.diagSection}>
                <Text style={styles.diagLabel}>{'Diagnostic'}</Text>
                <Text style={styles.diagValue}>{String(patient.diagnosis)}</Text>
              </View>
            )}
            {patient.notes && (
              <View style={styles.diagSection}>
                <Text style={styles.diagLabel}>{'Notes'}</Text>
                <Text style={styles.diagValue}>{String(patient.notes)}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Medical Acts */}
        <SectionTitle icon="💉" title="Actes Médicaux" count={medicalActs.length} />
        {medicalActs.length > 0 ? medicalActs.slice(0, 5).map((act) => (
          <View key={String(act.id)} style={styles.actCard}>
            <View style={styles.actHeader}>
              <View style={styles.actTypeBadge}>
                <Text style={styles.actTypeText}>{String(act.act_type)}</Text>
              </View>
              <Text style={styles.actDate}>{String(act.date)}</Text>
            </View>
            {act.diagnosis && <Text style={styles.actDetail}>{'Diagnostic: ' + String(act.diagnosis)}</Text>}
            {act.treatment && <Text style={styles.actDetail}>{'Traitement: ' + String(act.treatment)}</Text>}
            {act.notes && <Text style={styles.actNotes} numberOfLines={2}>{String(act.notes)}</Text>}
          </View>
        )) : (
          <Text style={styles.emptySmall}>{'Aucun acte médical'}</Text>
        )}

        {/* Navigation to Add Medical Act */}
        <PrimaryButton
          title="➕ Nouvel Acte Médical"
          variant="outline"
          onPress={() => navigation.navigate('AddMedicalAct', { patientId, patientName: patient.name })}
          style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}
        />

        {/* Appointments */}
        <SectionTitle icon="📅" title="Rendez-vous" count={appointments.length} />
        {appointments.length > 0 ? appointments.slice(0, 5).map((apt) => {
          const dateTime = apt.datetime_scheduled ? new Date(apt.datetime_scheduled).toLocaleString('fr-FR') : '--';
          return (
            <View key={String(apt.id)} style={styles.aptCard}>
              <Text style={styles.aptTime}>{dateTime}</Text>
              {apt.reason && <Text style={styles.aptReason}>{String(apt.reason)}</Text>}
              <View style={[styles.aptStatus, {
                backgroundColor: apt.status === 'completed' ? colors.success + '15' : colors.primary + '15',
              }]}>
                <Text style={[styles.aptStatusText, {
                  color: apt.status === 'completed' ? colors.success : colors.primary,
                }]}>
                  {apt.status === 'completed' ? 'Terminé' : apt.status === 'cancelled' ? 'Annulé' : 'Planifié'}
                </Text>
              </View>
            </View>
          );
        }) : (
          <Text style={styles.emptySmall}>{'Aucun rendez-vous'}</Text>
        )}

        {/* PDF Export */}
        <PrimaryButton
          title="📄 Exporter Dossier PDF"
          onPress={handleExportPdf}
          loading={exportingPdf}
          style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...fonts.body },
  backBtn: { marginBottom: spacing.md },
  backText: { ...fonts.body, color: colors.primary, fontWeight: '600' },
  // Profile
  profileCard: {
    alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md,
    ...shadows.elevated,
  },
  avatarLarge: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarLargeText: { color: colors.primary, fontSize: 26, fontWeight: '700' },
  patientName: { ...fonts.heading, fontSize: 22, textAlign: 'center' },
  patientSub: { ...fonts.caption, marginTop: 4, textAlign: 'center' },
  statusChip: { marginTop: spacing.sm, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  statusChipText: { fontSize: 13, fontWeight: '600' },
  // Info
  infoGrid: { marginTop: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm + 2 },
  infoIcon: { fontSize: 16, marginRight: spacing.sm, marginTop: 2 },
  infoContent: { flex: 1 },
  infoLabel: { ...fonts.label, fontSize: 11 },
  infoValue: { ...fonts.body, color: colors.textPrimary, fontWeight: '500', marginTop: 1 },
  // Diagnosis
  diagSection: { marginTop: spacing.md },
  diagLabel: { ...fonts.label, fontSize: 11, marginBottom: 2 },
  diagValue: { ...fonts.body, color: colors.textPrimary },
  // Sections
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: spacing.sm, marginTop: spacing.md,
  },
  sectionIcon: { fontSize: 18, marginRight: spacing.sm },
  sectionTitle: { ...fonts.subheading, flex: 1 },
  sectionBadge: {
    backgroundColor: colors.primaryLight, paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: radius.full,
  },
  sectionBadgeText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  // Acts
  actCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm, ...shadows.card,
  },
  actHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  actTypeBadge: {
    backgroundColor: colors.accent + '15', paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: radius.full,
  },
  actTypeText: { color: colors.accent, fontWeight: '600', fontSize: 12 },
  actDate: { ...fonts.caption },
  actDetail: { ...fonts.body, fontSize: 13, marginTop: 4 },
  actNotes: { ...fonts.caption, marginTop: 4, fontStyle: 'italic' },
  // Appointments
  aptCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm, ...shadows.card,
  },
  aptTime: { ...fonts.subheading, fontSize: 14, color: colors.primary },
  aptReason: { ...fonts.caption, marginTop: 4 },
  aptStatus: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full, marginTop: spacing.sm },
  aptStatusText: { fontSize: 11, fontWeight: '600' },
  emptySmall: { ...fonts.caption, textAlign: 'center', marginVertical: spacing.md },
});
