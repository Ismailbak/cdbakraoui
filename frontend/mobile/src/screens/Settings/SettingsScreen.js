import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts, spacing } from '../../styles/theme';
import PhoneShell, { ScreenHeader } from '../../components/common/PhoneShell';

function SettingRow({ icon, label, value, onPress, danger, toggle, enabled, onToggle }) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !toggle}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Feather name={icon} size={17} color={danger ? colors.error : colors.mobilePrimary} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.settingLabel, danger && { color: colors.error }]}>{label}</Text>
        {value ? <Text style={styles.settingValue}>{String(value)}</Text> : null}
      </View>
      {toggle ? (
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: '#D6D6D6', true: colors.mobilePrimary }}
          thumbColor={colors.surface}
          ios_backgroundColor="#D6D6D6"
        />
      ) : onPress ? (
        <Feather name="chevron-right" size={17} color={colors.mobileMuted} />
      ) : null}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen({ navigation }) {
  const [appVersion] = useState('1.0.0');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

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
    <PhoneShell contentStyle={styles.content}>
      <ScreenHeader title="Paramètres" onBack={() => navigation.goBack()} />

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Feather name="user" size={24} color={colors.surface} />
        </View>
        <View style={styles.profileText}>
          <Text style={styles.profileTitle}>Cabinet rhumatologie</Text>
          <Text style={styles.profileSubtitle}>Préférences de l'application mobile</Text>
        </View>
      </View>

      <SectionHeader title="Général" />
      <View style={styles.settingGroup}>
        <SettingRow icon="edit-3" label="Modifier le profil" onPress={() => {}} />
        <SettingRow icon="lock" label="Changer le mot de passe" onPress={() => {}} />
        <SettingRow icon="globe" label="Langue" value="Français" onPress={() => {}} />
        <SettingRow icon="map-pin" label="Emplacement" value="Cabinet" onPress={() => {}} />
      </View>

      <SectionHeader title="Notification" />
      <View style={styles.settingGroup}>
        <SettingRow
          icon="bell"
          label="Notifications push"
          toggle
          enabled={pushEnabled}
          onToggle={setPushEnabled}
        />
        <SettingRow
          icon="mail"
          label="Rappels par email"
          toggle
          enabled={emailEnabled}
          onToggle={setEmailEnabled}
        />
      </View>

      <SectionHeader title="Aide et confidentialité" />
      <View style={styles.settingGroup}>
        <SettingRow icon="file-text" label="Conditions d'utilisation" onPress={() => {}} />
        <SettingRow icon="shield" label="Politique de confidentialité" onPress={() => {}} />
        <SettingRow icon="help-circle" label="Support" onPress={() => {}} />
        <SettingRow icon="info" label="Version" value={appVersion} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Feather name="log-out" size={17} color={colors.error} />
        <Text style={styles.logoutText}>{'Se déconnecter'}</Text>
      </TouchableOpacity>
    </PhoneShell>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 90 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mobileBackground,
    borderRadius: 22,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.mobilePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileText: {
    flex: 1,
  },
  profileTitle: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '900',
  },
  profileSubtitle: {
    color: '#D6ECEE',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.mobileText,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  settingGroup: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    minHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: colors.mobileDivider,
    paddingVertical: spacing.sm,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#E9F7F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rowIconDanger: {
    backgroundColor: colors.errorLight,
  },
  rowText: {
    flex: 1,
  },
  settingLabel: {
    color: colors.mobileText,
    fontSize: 14,
    fontWeight: '800',
  },
  settingValue: { ...fonts.caption, color: colors.mobileMuted, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  logoutText: { ...fonts.bodySmall, color: colors.error, fontWeight: '700' },
});
