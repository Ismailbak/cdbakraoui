import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAnalyticsSummary } from '../api/api';
import { colors, fonts, spacing, radius, shadows } from '../styles/theme';
import Card from '../components/common/Card';

export default function DashboardScreen() {
  const [summary, setSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const isSmall = width < 360;
  const cardPadding = isSmall ? spacing.md : spacing.lg;

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
        contentContainerStyle={[styles.content, { padding: cardPadding }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={[styles.greeting, isSmall && { fontSize: 22 }]}>{'Bonjour, Docteur '}</Text>
        <Text style={styles.date}>{dateStr}</Text>

        {summary ? (
          <View>
            <View style={styles.kpiRow}>
              <Card
                title="Patients"
                value={summary.total_patients}
                icon="👥"
                accentColor={colors.primary}
                style={styles.kpiCard}
              />
              <Card
                title="Âge Moyen"
                value={summary.avg_age}
                icon="📈"
                accentColor={colors.accent}
                style={styles.kpiCard}
              />
            </View>

            {summary.common_diagnoses && summary.common_diagnoses.length > 0 ? (
              <Card title="Top Diagnostics" icon="🩺" accentColor={colors.warning}>
                <View style={styles.diagList}>
                  {summary.common_diagnoses.map((d, i) => (
                    <View key={String(i)} style={styles.diagItem}>
                      <View style={styles.diagBadge}>
                        <Text style={styles.diagBadgeText}>{String(i + 1)}</Text>
                      </View>
                      <Text style={styles.diagText}>{String(d)}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            ) : null}

            {summary.treatments && summary.treatments.length > 0 ? (
              <Card title="Traitements Fréquents" icon="💊" accentColor={colors.success}>
                <View style={styles.treatList}>
                  {summary.treatments.map((t, i) => (
                    <View key={String(i)} style={styles.treatRow}>
                      <Text style={styles.treatName} numberOfLines={1}>{String(t.name)}</Text>
                      <View style={styles.treatBarBg}>
                        <View style={[styles.treatBar, { width: String(t.percentage) + '%' }]} />
                      </View>
                      <Text style={styles.treatPct}>{String(t.percentage) + '%'}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            ) : null}
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{'Chargement des données...'}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 100 },
  greeting: { ...fonts.heading, marginBottom: 2 },
  date: { ...fonts.caption, marginBottom: spacing.lg },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between' },
  kpiCard: { flex: 1, marginHorizontal: 4 },
  diagList: { marginTop: spacing.md },
  diagItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  diagBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.warning + '20',
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm,
  },
  diagBadgeText: { fontSize: 12, fontWeight: '700', color: colors.warning },
  diagText: { ...fonts.body, flex: 1 },
  treatList: { marginTop: spacing.md },
  treatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  treatName: { ...fonts.caption, width: 90 },
  treatBarBg: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, marginHorizontal: spacing.sm },
  treatBar: { height: 6, backgroundColor: colors.success, borderRadius: 3 },
  treatPct: { ...fonts.caption, width: 36, textAlign: 'right' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  loadingText: { ...fonts.body },
});
