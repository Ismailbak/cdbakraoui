import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, Modal, Alert, useWindowDimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  getAppointments, createAppointment, getPatients, deleteAppointment,
} from '../../api/api';
import { colors, fonts, spacing, radius, shadows } from '../../styles/theme';
import Input from '../../components/common/Input';
import PrimaryButton from '../../components/common/PrimaryButton';

// Updated status colors using new palette
const STATUS_COLORS = {
  scheduled: { bg: colors.rdvLight, text: colors.rdv, label: 'Planifié', icon: 'calendar' },
  completed: { bg: colors.appointmentSuccessLight, text: colors.appointmentSuccess, label: 'Terminé', icon: 'check-circle' },
  cancelled: { bg: colors.errorLight, text: colors.error, label: 'Annulé', icon: 'x-circle' },
};

function getStatusStyle(status) {
  return STATUS_COLORS[status] || STATUS_COLORS.scheduled;
}

function groupByDate(appointments) {
  const groups = {};
  appointments.forEach((a) => {
    const key = a.date || 'Sans date';
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }));
}

function formatDateLabel(dateStr) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((d - today) / 86400000);
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Demain';
    if (diff === -1) return 'Hier';
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
  } catch {
    return dateStr;
  }
}

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patient_id: '', date: '', time: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const fetchData = useCallback(() => {
    getAppointments()
      .then((res) => setAppointments(res.data))
      .catch(() => {})
      .finally(() => setRefreshing(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openModal = () => {
    setForm({ patient_id: '', date: '', time: '', reason: '' });
    setSelectedPatient(null);
    getPatients()
      .then((res) => setPatients(res.data))
      .catch(() => {});
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.patient_id || !form.date || !form.time) {
      Alert.alert('Erreur', 'Patient, date et heure sont obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      await createAppointment({
        patient_id: parseInt(form.patient_id, 10),
        date: form.date,
        time: form.time,
        reason: form.reason || null,
        status: 'scheduled',
      });
      setShowModal(false);
      fetchData();
    } catch {
      Alert.alert('Erreur', 'Impossible de créer le rendez-vous.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirmer', 'Supprimer ce rendez-vous ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await deleteAppointment(id);
            fetchData();
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer.');
          }
        },
      },
    ]);
  };

  const grouped = groupByDate(appointments);
  const totalCount = appointments.length;
  const todayCount = appointments.filter((a) => {
    const today = new Date().toISOString().split('T')[0];
    return a.date === today;
  }).length;

  const renderAppointment = (item) => {
    const st = getStatusStyle(item.status);
    return (
      <TouchableOpacity
        key={String(item.id)}
        style={styles.apptCard}
        activeOpacity={0.7}
        onLongPress={() => handleDelete(item.id)}
      >
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{String(item.time || '--:--')}</Text>
          <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
            <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
          </View>
        </View>
        <View style={styles.apptInfo}>
          <Text style={styles.patientName}>{String(item.patient_name || 'Patient #' + item.patient_id)}</Text>
          {item.reason ? (
            <Text style={styles.reason} numberOfLines={2}>{String(item.reason)}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = ({ item: group }) => (
    <View style={styles.section}>
      <View style={styles.dateHeader}>
        <View style={styles.dateDot} />
        <Text style={styles.dateLabel}>{formatDateLabel(group.date)}</Text>
        <Text style={styles.dateCount}>{String(group.items.length)}</Text>
      </View>
      {group.items.map(renderAppointment)}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, isSmall && { fontSize: 22 }]}>{'Rendez-vous'}</Text>
          <Text style={styles.subtitle}>
            {String(todayCount) + " aujourd'hui · " + String(totalCount) + ' total'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openModal} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>{'+'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(item) => item.date}
        renderItem={renderSection}
        contentContainerStyle={[styles.list, { paddingHorizontal: isSmall ? spacing.md : spacing.lg }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{'📅'}</Text>
            <Text style={styles.emptyText}>{'Aucun rendez-vous'}</Text>
          </View>
        }
      />

      {/* Add Appointment Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{'Nouveau Rendez-vous'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>{'✕'}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Patient Picker */}
              <Text style={styles.fieldLabel}>{'PATIENT'}</Text>
              <TouchableOpacity
                style={styles.pickerBtn}
                onPress={() => setShowPatientPicker(!showPatientPicker)}
              >
                <Text style={selectedPatient ? styles.pickerText : styles.pickerPlaceholder}>
                  {selectedPatient ? selectedPatient.name : 'Sélectionner un patient'}
                </Text>
                <Text style={styles.pickerArrow}>{'▾'}</Text>
              </TouchableOpacity>

              {showPatientPicker && (
                <View style={styles.pickerDropdown}>
                  <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                    {patients.map((p) => (
                      <TouchableOpacity
                        key={String(p.id)}
                        style={styles.pickerItem}
                        onPress={() => {
                          setSelectedPatient(p);
                          setForm({ ...form, patient_id: String(p.id) });
                          setShowPatientPicker(false);
                        }}
                      >
                        <Text style={styles.pickerItemText}>{String(p.name)}</Text>
                        <Text style={styles.pickerItemSub}>{String(p.diagnosis || '')}</Text>
                      </TouchableOpacity>
                    ))}
                    {patients.length === 0 && (
                      <Text style={styles.pickerEmpty}>{'Aucun patient'}</Text>
                    )}
                  </ScrollView>
                </View>
              )}

              <Input
                label="Date (AAAA-MM-JJ)"
                placeholder="2026-04-03"
                value={form.date}
                onChangeText={(v) => setForm({ ...form, date: v })}
              />
              <Input
                label="Heure (HH:MM)"
                placeholder="09:30"
                value={form.time}
                onChangeText={(v) => setForm({ ...form, time: v })}
              />
              <Input
                label="Motif (optionnel)"
                placeholder="Consultation de suivi..."
                value={form.reason}
                onChangeText={(v) => setForm({ ...form, reason: v })}
                multiline
              />
              <PrimaryButton title="Créer" onPress={handleSubmit} loading={submitting} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },
  title: { ...fonts.heading },
  subtitle: { ...fonts.caption, marginTop: 2 },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    ...shadows.elevated,
  },
  addBtnText: { color: '#FFF', fontSize: 26, fontWeight: '300', marginTop: -2 },
  list: { paddingBottom: 100 },
  section: { marginBottom: spacing.lg },
  dateHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  dateDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.primary, marginRight: spacing.sm,
  },
  dateLabel: { ...fonts.subheading, fontSize: 15, flex: 1, textTransform: 'capitalize' },
  dateCount: {
    ...fonts.caption, backgroundColor: colors.primaryLight,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full,
    color: colors.primary, fontWeight: '600', fontSize: 12, overflow: 'hidden',
  },
  apptCard: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md,
    marginBottom: spacing.sm, marginLeft: spacing.lg, ...shadows.card,
  },
  timeColumn: { alignItems: 'center', marginRight: spacing.md, minWidth: 60 },
  timeText: { ...fonts.subheading, fontSize: 16, color: colors.primary },
  statusBadge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  statusText: { fontSize: 10, fontWeight: '600' },
  apptInfo: { flex: 1 },
  patientName: { ...fonts.subheading, fontSize: 15 },
  reason: { ...fonts.caption, marginTop: 4, lineHeight: 18 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...fonts.body },
  // Modal styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface, borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl, padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.lg,
  },
  modalTitle: { ...fonts.heading, fontSize: 20 },
  modalClose: { fontSize: 22, color: colors.textMuted, padding: spacing.sm },
  fieldLabel: { ...fonts.label, marginBottom: spacing.xs },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.inputBg, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 14,
    marginBottom: spacing.md,
  },
  pickerText: { fontSize: 15, color: colors.textPrimary },
  pickerPlaceholder: { fontSize: 15, color: colors.textMuted },
  pickerArrow: { fontSize: 14, color: colors.textMuted },
  pickerDropdown: {
    backgroundColor: colors.surface, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
    marginTop: -spacing.sm, ...shadows.card,
  },
  pickerItem: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pickerItemText: { ...fonts.body, color: colors.textPrimary, fontWeight: '500' },
  pickerItemSub: { ...fonts.caption, marginTop: 2 },
  pickerEmpty: { ...fonts.caption, textAlign: 'center', paddingVertical: spacing.md },
});
