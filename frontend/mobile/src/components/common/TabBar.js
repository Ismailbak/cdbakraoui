import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, fonts, spacing, radius, shadows } from '../../styles/theme';

export default function TabBar({ 
  tabs = [], // [{ id: 'tab1', label: 'Tab 1', badge: 0 }]
  activeTab = 'tab1',
  onTabChange = () => {},
  scrollable = false
}) {
  const TabContent = (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.tabActive,
          ]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === tab.id && styles.tabLabelActive,
            ]}
          >
            {tab.label}
          </Text>
          {tab.badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{tab.badge}</Text>
            </View>
          )}
          {activeTab === tab.id && <View style={styles.indicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  return scrollable ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      {TabContent}
    </ScrollView>
  ) : (
    TabContent
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingHorizontal: spacing.lg,
  },
  scrollView: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    ...fonts.body,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    bottom: -1,
    width: '100%',
    height: 2,
    backgroundColor: colors.primary,
  },
});
