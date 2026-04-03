import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAnalyticsSummary } from '../../api/api';
import { colors, fonts, spacing, radius, shadows } from '../../styles/theme';
import Card from '../../components/common/Card';

export default function AnalyticsScreen() {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const fetchData = () => {
    getAnalyticsSummary()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setRefreshing(false));
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{'Chargement des statistiques...'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { padding: isSmall ? spacing.md : spacing.lg }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.title}>{'Statistiques'}</Text>

        <View style={styles.kpiRow}>
          <Card title="Patients" value={data.total_patients} icon="👥" accentColor={colors.primary} style={styles.kpiCard} />
          <Card title="Âge Moyen" value={data.avg_age} icon="📊" accentColor={colors.accent} style={styles.kpiCard} />
        </View>

        {data.demographics && data.demographics.length > 0 ? (
          <Card title="Démographie" icon="📋" accentColor={colors.primary}>
            <View style={styles.demoTable}>
              <View style={styles.demoHeader}>
                <Text style={[styles.demoLabel, { flex: 2 }]}>{'Tranche'}</Text>
                <Text style={styles.demoLabel}>{'Hommes'}</Text>
                <Text style={styles.demoLabel}>{'Femmes'}</Text>
              </View>
              {data.demographics.map((d, i) => (
                <View key={String(i)} style={styles.demoRow}>
                  <Text style={[styles.demoAge, { flex: 2 }]}>{String(d.age)}</Text>
                  <Text style={styles.demoVal}>{String(d.male)}</Text>
                  <Text style={styles.demoVal}>{String(d.female)}</Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {data.weekly_activity && data.weekly_activity.length > 0 ? (
          <Card title="Activité Hebdomadaire" icon="📅" accentColor={colors.success}>
            <View style={styles.weekTable}>
              {data.weekly_activity.map((w, i) => {
                const total = (w.consultations || 0) + (w.suivis || 0) + (w.urgences || 0);
                return (
                  <View key={String(i)} style={styles.weekRow}>
                    <Text style={styles.weekDay}>{String(w.day)}</Text>
                    <View style={styles.weekBarBg}>
                      <View style={[styles.weekBar, { width: Math.min(total * 10, 100) + '%' }]} />
                    </View>
                    <Text style={styles.weekTotal}>{String(total)}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
        ) : null}

        {data.revenue_trends && data.revenue_trends.length > 0 ? (
          <Card title="Revenus Mensuels" icon="💰" accentColor={colors.warning}>
            <View style={styles.revTable}>
              {data.revenue_trends.filter((r) => r.revenue > 0).length > 0 ? (
                data.revenue_trends.filter((r) => r.revenue > 0).map((r, i) => (
                  <View key={String(i)} style={styles.revRow}>
                    <Text style={styles.revMonth}>{String(r.month)}</Text>
                    <Text style={styles.revAmount}>{String(r.revenue.toLocaleString()) + ' MAD'}</Text>
                    <Text style={styles.revPatients}>{String(r.patients) + ' pts'}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>{'Aucune donnée de revenu'}</Text>
              )}
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 100 },
  title: { ...fonts.heading, marginBottom: spacing.lg },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between' },
  kpiCard: { flex: 1, marginHorizontal: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...fonts.body },
  demoTable: { marginTop: spacing.md },
  demoHeader: { flexDirection: 'row', marginBottom: spacing.xs, paddingBottom: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  demoLabel: { ...fonts.label, flex: 1, textAlign: 'center' },
  demoRow: { flexDirection: 'row', paddingVertical: spacing.xs },
  demoAge: { ...fonts.body, flex: 1, textAlign: 'center' },
  demoVal: { ...fonts.body, flex: 1, textAlign: 'center', fontWeight: '600', color: colors.textPrimary },
  weekTable: { marginTop: spacing.md },
  weekRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  weekDay: { ...fonts.caption, width: 36 },
  weekBarBg: { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4, marginHorizontal: spacing.sm },
  weekBar: { height: 8, backgroundColor: colors.success, borderRadius: 4 },
  weekTotal: { ...fonts.caption, width: 28, textAlign: 'right' },
  revTable: { marginTop: spacing.md },
  revRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  revMonth: { ...fonts.body, fontWeight: '600', width: 50 },
  revAmount: { ...fonts.body, color: colors.textPrimary, fontWeight: '600' },
  revPatients: { ...fonts.caption, width: 50, textAlign: 'right' },
  emptyText: { ...fonts.caption, textAlign: 'center', marginTop: spacing.md },
});
