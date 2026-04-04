import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../../api/api';
import { colors, fonts, spacing, radius } from '../../styles/theme';
import Input from '../../components/common/Input';
import PrimaryButton from '../../components/common/PrimaryButton';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await login(username, password);
      await AsyncStorage.setItem('token', res.data.access_token);
      navigation.replace('Main');
    } catch (e) {
      setError('Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.headerSection}>
          <View style={styles.iconWrapper}>
            <Feather name="heart" size={56} color={colors.primary} />
          </View>
          <Text style={styles.title}>MedAI</Text>
          <Text style={styles.subtitle}>Assistant Médical Intelligent</Text>
        </View>

        <View style={[styles.formSection, { paddingHorizontal: spacing.lg }]}>
          <Input
            label="Nom d'utilisateur"
            placeholder="Entrez votre identifiant"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Input
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={error || undefined}
          />
          <PrimaryButton
            title="Se connecter"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <Text style={styles.footer}>© 2026 MedAI · Tous droits réservés</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl + 8,
  },
  iconWrapper: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...fonts.body,
    color: colors.textMuted,
  },
  formSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  footer: {
    ...fonts.caption,
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
});
