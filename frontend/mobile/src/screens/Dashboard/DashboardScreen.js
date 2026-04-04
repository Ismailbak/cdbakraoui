import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAnalyticsSummary } from '../../api/api';
import { colors, fonts, spacing, radius, shadows } from '../../styles/theme';
import Card from '../../components/common/Card';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [summary, setSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    getAnalyticsSummary()
      .then((res) => setSummary(res.data))
      .catch(() => {})
      .finally(() => setRefreshing(false));
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Clean Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, Docteur</Text>
            <Text style={styles.date}>{dateStr}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerAction}>
            <Feather name="user" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick AI Chat Card */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Chat')}
          style={styles.aiCallout}
        >
          <View style={styles.aiCalloutContent}>
            <View>
              <Text style={styles.aiCalloutTitle}>Assistant Médical</Text>
              <Text style={styles.aiCalloutSubtitle}>Besoin d'aide ?</Text>
            </View>
            <Feather name="send" size={20} color={colors.textPrimary} />
          </View>
        </TouchableOpacity>

        {summary ? (
          <>
            {/* KPI Cards - Clean */}
            <View style={styles.kpiSection}>
              <View style={[styles.kpiCard, { backgroundColor: colors.patientLight }]}>
                <View style={styles.kpiIcon}>
                  <Feather name="users" size={20} color={colors.patient} />
                </View>
                <Text style={styles.kpiValue}>{summary.total_patients}</Text>
                <Text style={styles.kpiLabel}>Patients</Text>
              </View>
              <View style={[styles.kpiCard, { backgroundColor: colors.rdvLight }]}>
                <View style={styles.kpiIcon}>
                  <Feather name="trending-up" size={20} color={colors.rdv} />
                </View>
                <Text style={styles.kpiValue}>{summary.avg_age}</Text>
                <Text style={styles.kpiLabel}>Âge Moyen</Text>
              </View>
            </View>

            {/* Diagnostics Section */}
            {summary.common_diagnoses && summary.common_diagnoses.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="activity" size={18} color={colors.actes} />
                  <Text style={styles.sectionTitle}>Diagnostics Fréquents</Text>
                </View>
                <View style={styles.listCard}>
                  {summary.common_diagnoses.slice(0, 5).map((d, i) => (
                    <View key={String(i)} style={[styles.listItem, i < summary.common_diagnoses.length - 1 && styles.listItemBorder]}>
                      <View style={[styles.badge, { backgroundColor: colors.actesLight }]}>
                        <Text style={[styles.badgeText, { color: colors.actes }]}>{i + 1}</Text>
                      </View>
                      <Text style={styles.listItemText}>{String(d)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Treatments Section */}
            {summary.treatments && summary.treatments.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="droplet" size={18} color={colors.appointmentSuccess} />
                  <Text style={styles.sectionTitle}>Traitements Populaires</Text>
                </View>
                <View style={styles.listCard}>
                  {summary.treatments.slice(0, 5).map((t, i) => (
                    <View key={String(i)} style={[styles.treatmentItem, i < summary.treatments.length - 1 && styles.listItemBorder]}>
                      <View style={styles.treatmentName}>
                        <Text style={styles.treatmentLabel}>{String(t.name)}</Text>
                        <View style={styles.barContainer}>
                          <View style={[styles.bar, { width: `${t.percentage}%`, backgroundColor: colors.appointmentSuccess }]} />
                        </View>
                      </View>
                      <Text style={styles.percentage}>{t.percentage}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Feather name="loader" size={32} color={colors.primary} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ─── Layout ───
  safe: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  scroll: { 
    flex: 1 
  },
  content: { 
    paddingHorizontal: spacing.lg, 
    paddingTop: spacing.md, 
    paddingBottom: 100 
  },

  // ─── Header ───
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    ...fonts.heading,
    fontSize: 32,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  date: {
    ...fonts.caption,
    color: colors.textMuted,
  },
  headerAction: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },

  // ─── AI Callout ───
  aiCallout: {
    backgroundColor: colors.aiGradientStart,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  aiCalloutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiCalloutTitle: {
    ...fonts.subheading,
    fontSize: 16,
    color: colors.textPrimary,
  },
  aiCalloutSubtitle: {
    ...fonts.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // ─── KPI Cards ───
  kpiSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  kpiCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  kpiLabel: {
    ...fonts.caption,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // ─── Sections ───
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...fonts.subheading,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },

  // ─── List Items ───
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  listItemText: {
    ...fonts.body,
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ─── Treatment Items ───
  treatmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  treatmentName: {
    flex: 1,
  },
  treatmentLabel: {
    ...fonts.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  barContainer: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  bar: {
    height: 6,
    borderRadius: radius.sm,
  },
  percentage: {
    ...fonts.caption,
    color: colors.textPrimary,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },

  // ─── Loading ───
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...fonts.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
