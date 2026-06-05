import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAnalyticsSummary } from '../../api/api';
import { colors, fonts, spacing, radius } from '../../styles/theme';
import PhoneShell from '../../components/common/PhoneShell';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { hapticFeedback } from '../../utils/haptics';

const QUICK_ACTIONS = [
  { icon: 'users', label: 'Patients', target: 'Patients' },
  { icon: 'calendar', label: 'RDV', target: 'Appointments' },
  { icon: 'message-circle', label: 'Assistant', target: 'Chat' },
  { icon: 'bar-chart-2', label: 'Stats', target: 'More' },
  { icon: 'bell', label: 'Alertes', target: 'More' },
];

function SectionTitle({ title, action = 'Voir tout', onPress }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function QuickAction({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.quickIconBox}>
        <Feather name={icon} size={20} color={colors.mobilePrimary} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function MetricBox({ value, label }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricValue}>{value ?? '0'}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function formatAverageAge(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toFixed(1);
}

function CabinetSummaryCard({ summary }) {
  return (
    <View style={styles.cabinetCard}>
      <View style={styles.cabinetIcon}>
        <Feather name="activity" size={34} color={colors.mobilePrimary} />
      </View>
      <View style={styles.cabinetInfo}>
        <Text style={styles.cabinetTitle}>Vue du cabinet</Text>
        <Text style={styles.cabinetSubtitle}>{'R\u00e9sum\u00e9 clinique en temps r\u00e9el'}</Text>
        <View style={styles.metricsRow}>
          <MetricBox value={summary?.total_patients} label="PAT" />
          <MetricBox value={summary?.appointments_today || 0} label="RDV" />
          <MetricBox value={formatAverageAge(summary?.avg_age)} label={'\u00c2GE'} />
        </View>
      </View>
    </View>
  );
}

function InsightCard({ rank, title, subtitle, icon = 'activity' }) {
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightRank}>
        <Text style={styles.insightRankText}>{rank}</Text>
      </View>
      <View style={styles.insightBody}>
        <Text style={styles.insightTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.insightSubtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
      <View style={styles.insightIcon}>
        <Feather name={icon} size={15} color={colors.mobilePrimary} />
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [summary, setSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    getAnalyticsSummary()
      .then((res) => {
        setSummary(res.data);
        hapticFeedback.success();
      })
      .catch((err) => {
        hapticFeedback.error();
        console.log('Error fetching analytics:', err);
        setSummary(null);
      })
      .finally(() => setRefreshing(false));
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const dateStr = useMemo(() => new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }), []);

  const diagnoses = summary?.common_diagnoses || [];
  const treatments = summary?.treatments || [];

  return (
    <PhoneShell scroll={false} contentStyle={styles.shellContent}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.mobilePrimary} />
        }
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>Dr</Text>
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.greeting}>Bonjour, Docteur</Text>
            <Text style={styles.subGreeting}>{dateStr}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.8} onPress={() => navigation.navigate('More')}>
            <Feather name="bell" size={18} color={colors.surface} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.hero} activeOpacity={0.9} onPress={() => navigation.navigate('Chat')}>
          <Text style={styles.heroTitle}>{'Assistant m\u00e9dical,\npatients ou rendez-vous'}</Text>
          <View style={styles.searchBox}>
            <Feather name="search" size={18} color="rgba(255,255,255,0.72)" />
            <Text style={styles.searchPlaceholder}>Rechercher patient, acte, RDV...</Text>
          </View>
        </TouchableOpacity>

        <SectionTitle title={'Acc\u00e8s rapides'} onPress={() => navigation.navigate('More')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
          {QUICK_ACTIONS.map((action) => (
            <QuickAction
              key={action.label}
              icon={action.icon}
              label={action.label}
              onPress={() => navigation.navigate(action.target)}
            />
          ))}
        </ScrollView>

        {summary ? (
          <>
            <CabinetSummaryCard summary={summary} />

            <SectionTitle title={'Diagnostics fr\u00e9quents'} onPress={() => navigation.navigate('More')} />
            {diagnoses.length > 0 ? (
              diagnoses.slice(0, 3).map((item, index) => (
                <InsightCard
                  key={`${item?.name || item}-${index}`}
                  rank={index + 1}
                  title={item?.name || String(item)}
                  subtitle={'Diagnostic enregistr\u00e9'}
                  icon="activity"
                />
              ))
            ) : (
              <EmptyState icon="inbox" title="Pas de diagnostics" description={'Aucun diagnostic enregistr\u00e9 pour le moment'} />
            )}

            <SectionTitle title="Traitements suivis" onPress={() => navigation.navigate('More')} />
            {treatments.length > 0 ? (
              treatments.slice(0, 3).map((item, index) => (
                <InsightCard
                  key={`${item?.treatment || item}-${index}`}
                  rank={index + 1}
                  title={item?.treatment || String(item)}
                  subtitle={`${item?.count || 0} occurrence(s)`}
                  icon="droplet"
                />
              ))
            ) : (
              <EmptyState icon="package" title="Pas de traitements" description={'Aucun traitement enregistr\u00e9 pour le moment'} />
            )}
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <SkeletonLoader height={100} count={2} style={{ marginBottom: spacing.md }} />
            <SkeletonLoader height={56} count={3} />
          </View>
        )}
      </ScrollView>
    </PhoneShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 124,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#A9DCE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: 22,
  },
  headerTextWrap: {
    flex: 1,
  },
  greeting: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.mobileText,
    letterSpacing: -0.5,
  },
  subGreeting: {
    ...fonts.caption,
    color: colors.mobileMuted,
    marginTop: 1,
    textTransform: 'capitalize',
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.mobileBackground,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 13,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  hero: {
    backgroundColor: colors.mobileBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  searchBox: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchPlaceholder: {
    ...fonts.caption,
    color: 'rgba(255,255,255,0.52)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.mobileText,
    letterSpacing: -0.4,
  },
  sectionAction: {
    ...fonts.caption,
    color: colors.mobilePrimary,
    fontWeight: '800',
  },
  quickRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
    marginBottom: spacing.md,
  },
  quickAction: {
    alignItems: 'center',
    width: 58,
  },
  quickIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickLabel: {
    fontSize: 9,
    color: colors.mobileMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  cabinetCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cabinetIcon: {
    width: 76,
    height: 84,
    borderRadius: 14,
    backgroundColor: '#E7EAEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  cabinetInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cabinetTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.mobileText,
    letterSpacing: -0.4,
  },
  cabinetSubtitle: {
    ...fonts.caption,
    color: colors.mobileMuted,
    marginBottom: spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 5,
  },
  metricBox: {
    flex: 1,
    minWidth: 0,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.mobilePanel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 12,
    color: colors.mobileText,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 7,
    color: colors.mobileMuted,
    fontWeight: '700',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  insightRank: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#E9F7F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  insightRankText: {
    color: colors.mobilePrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  insightBody: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    color: colors.mobileText,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  insightSubtitle: {
    ...fonts.caption,
    color: colors.mobileMuted,
    marginTop: 2,
  },
  insightIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E9F7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
  },
});
