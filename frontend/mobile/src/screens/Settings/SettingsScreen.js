import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts, spacing, radius, shadows } from '../../styles/theme';

function SettingRow({ icon, label, value, onPress, danger }) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={[styles.settingLabel, danger && { color: colors.error }]}>{label}</Text>
      {value ? <Text style={styles.settingValue}>{String(value)}</Text> : null}
      {onPress && <Text style={styles.settingChevron}>{'›'}</Text>}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen({ navigation }) {
  const [appVersion] = useState('1.0.0');
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.content, { padding: isSmall ? spacing.md : spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, isSmall && { fontSize: 22 }]}>{'Paramètres'}</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{'🩺'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{'Docteur'}</Text>
            <Text style={styles.profileRole}>{'Rhumatologue · MedAI'}</Text>
          </View>
        </View>

        {/* App Settings */}
        <SectionHeader title="APPLICATION" />
        <View style={styles.settingGroup}>
          <SettingRow icon="🌐" label="Langue" value="Français" />
          <SettingRow icon="🔔" label="Notifications" value="Activées" />
          <SettingRow icon="🎨" label="Thème" value="Clair" />
          <SettingRow icon="📱" label="Version" value={appVersion} />
        </View>

        {/* Medical Settings */}
        <SectionHeader title="MÉDICAL" />
        <View style={styles.settingGroup}>
          <SettingRow icon="🏥" label="Établissement" value="Cabinet" />
          <SettingRow icon="🩺" label="Spécialité" value="Rhumatologie" />
        </View>

        {/* Data */}
        <SectionHeader title="DONNÉES" />
        <View style={styles.settingGroup}>
          <SettingRow icon="💾" label="Stockage local" value="AsyncStorage" />
          <SettingRow icon="🔗" label="Serveur API" value="192.168.1.199" />
        </View>

        {/* Legal */}
        <SectionHeader title="LÉGAL" />
        <View style={styles.settingGroup}>
          <SettingRow icon="📄" label="Conditions d'utilisation" onPress={() => {}} />
          <SettingRow icon="🔒" label="Politique de confidentialité" onPress={() => {}} />
          <SettingRow icon="ℹ️" label="À propos de MedAI" onPress={() => {}} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutIcon}>{'🚪'}</Text>
          <Text style={styles.logoutText}>{'Se déconnecter'}</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>{'© 2026 MedAI · Tous droits réservés'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 100 },
  title: { ...fonts.heading, marginBottom: spacing.lg },
  // Profile
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.lg, ...shadows.elevated,
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primaryLight, justifyContent: 'center',
    alignItems: 'center', marginRight: spacing.md,
  },
  profileAvatarText: { fontSize: 28 },
  profileInfo: { flex: 1 },
  profileName: { ...fonts.subheading, fontSize: 18 },
  profileRole: { ...fonts.caption, marginTop: 2 },
  // Section
  sectionHeader: {
    ...fonts.label, marginBottom: spacing.sm, marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  settingGroup: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    ...shadows.card, overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  settingIcon: { fontSize: 18, marginRight: spacing.md },
  settingLabel: { ...fonts.body, color: colors.textPrimary, flex: 1, fontWeight: '500' },
  settingValue: { ...fonts.caption, marginRight: spacing.xs },
  settingChevron: { fontSize: 20, color: colors.textMuted, fontWeight: '300' },
  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.error + '10', borderRadius: radius.md,
    paddingVertical: spacing.md, marginTop: spacing.xl,
    borderWidth: 1, borderColor: colors.error + '30',
  },
  logoutIcon: { fontSize: 18, marginRight: spacing.sm },
  logoutText: { ...fonts.subheading, fontSize: 16, color: colors.error },
  footer: { ...fonts.caption, textAlign: 'center', marginTop: spacing.lg },
});
