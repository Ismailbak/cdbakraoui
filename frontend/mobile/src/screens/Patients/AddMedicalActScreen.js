import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  KeyboardAvoidingView, Platform, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMedicalAct, getMedicalActTypes } from '../../api/api';
import { colors, fonts, spacing, radius, shadows } from '../../styles/theme';
import Input from '../../components/common/Input';
import PrimaryButton from '../../components/common/PrimaryButton';

export default function AddMedicalActScreen({ route, navigation }) {
  const { patientId, patientName } = route.params;
  const [actTypes, setActTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [form, setForm] = useState({
    act_date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    description: '',
    notes: '',
    amount: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  useEffect(() => {
    getMedicalActTypes()
      .then((res) => setActTypes(res.data))
      .catch(() => setActTypes(['Consultation', 'Examen', 'Infiltration', 'Bilan', 'Suivi']));
  }, []);

  const handleSubmit = async () => {
    if (!selectedType || !form.act_date) {
      Alert.alert('Erreur', "Le type d'acte et la date sont obligatoires.");
      return;
    }
    setSubmitting(true);
    try {
      await createMedicalAct({
        patient_id: patientId,
        act_type: selectedType,
        act_date: form.act_date,
        diagnosis: form.diagnosis || null,
        treatment: form.treatment || null,
        description: form.description || null,
        notes: form.notes || null,
        amount: form.amount || null,
        status: 'completed',
      });
      Alert.alert('Succès', 'Acte médical créé avec succès.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Erreur', "Impossible de créer l'acte médical.");
    } finally {
      setSubmitting(false);
    }
  };

  const typeIcons = {
    Consultation: '🩺',
    Examen: '🔬',
    Infiltration: '💉',
    Bilan: '📊',
    Suivi: '📋',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { padding: isSmall ? spacing.md : spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{'← Retour'}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{'Nouvel Acte Médical'}</Text>

          {/* Patient info bar */}
          <View style={styles.patientBar}>
            <Text style={styles.patientIcon}>{'👤'}</Text>
            <View>
              <Text style={styles.patientBarLabel}>{'Patient'}</Text>
              <Text style={styles.patientBarName}>{String(patientName || 'Patient #' + patientId)}</Text>
            </View>
          </View>

          {/* Act Type Picker */}
          <Text style={styles.fieldLabel}>{"TYPE D'ACTE *"}</Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowTypePicker(!showTypePicker)}
          >
            <Text style={selectedType ? styles.pickerText : styles.pickerPlaceholder}>
              {selectedType ? (typeIcons[selectedType] || '📋') + '  ' + selectedType : "Sélectionner le type d'acte"}
            </Text>
            <Text style={styles.pickerArrow}>{'▾'}</Text>
          </TouchableOpacity>

          {showTypePicker && (
            <View style={styles.pickerDropdown}>
              {actTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.pickerItem, selectedType === type && styles.pickerItemActive]}
                  onPress={() => {
                    setSelectedType(type);
                    setShowTypePicker(false);
                  }}
                >
                  <Text style={styles.pickerItemIcon}>{typeIcons[type] || '📋'}</Text>
                  <Text style={[
                    styles.pickerItemText,
                    selectedType === type && { color: colors.primary, fontWeight: '600' },
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Input
            label="Date *"
            placeholder="2026-04-03"
            value={form.date}
            onChangeText={(v) => setForm({ ...form, date: v })}
          />

          <Input
            label="Diagnostic"
            placeholder="Caries profonde, parodontite..."
            value={form.diagnosis}
            onChangeText={(v) => setForm({ ...form, diagnosis: v })}
            multiline
          />

          <Input
            label="Traitement"
            placeholder="Méthotrexate 15mg/semaine..."
            value={form.treatment}
            onChangeText={(v) => setForm({ ...form, treatment: v })}
            multiline
          />

          <Input
            label="Description"
            placeholder="Description de l'acte..."
            value={form.description}
            onChangeText={(v) => setForm({ ...form, description: v })}
            multiline
          />

          <Input
            label="Notes"
            placeholder="Notes complémentaires..."
            value={form.notes}
            onChangeText={(v) => setForm({ ...form, notes: v })}
            multiline
          />

          <Input
            label="Montant (MAD)"
            placeholder="500"
            value={form.amount}
            onChangeText={(v) => setForm({ ...form, amount: v })}
            keyboardType="numeric"
          />

          <PrimaryButton
            title="Enregistrer l'acte"
            onPress={handleSubmit}
            loading={submitting}
            style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 100 },
  backBtn: { marginBottom: spacing.md },
  backText: { ...fonts.body, color: colors.primary, fontWeight: '600' },
  title: { ...fonts.heading, marginBottom: spacing.lg },
  // Patient bar
  patientBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primaryLight, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  patientIcon: { fontSize: 24, marginRight: spacing.md },
  patientBarLabel: { ...fonts.label, fontSize: 10 },
  patientBarName: { ...fonts.subheading, fontSize: 16, color: colors.primary },
  // Field
  fieldLabel: { ...fonts.label, marginBottom: spacing.xs },
  // Picker
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
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.md, marginTop: -spacing.sm, ...shadows.card,
  },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pickerItemActive: { backgroundColor: colors.primaryLight },
  pickerItemIcon: { fontSize: 18, marginRight: spacing.sm },
  pickerItemText: { ...fonts.body, color: colors.textPrimary },
});
