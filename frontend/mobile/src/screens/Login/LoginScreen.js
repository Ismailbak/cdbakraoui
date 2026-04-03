import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { width, height } = useWindowDimensions();
  const isSmall = width < 360;

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
          <Text style={[styles.logo, isSmall && { fontSize: 44 }]}>{'🩺'}</Text>
          <Text style={[styles.title, isSmall && { fontSize: 26 }]}>{'MedAI'}</Text>
          <Text style={styles.subtitle}>{'Assistant Médical Intelligent'}</Text>
        </View>

        <View style={[styles.formSection, { paddingHorizontal: isSmall ? spacing.md : spacing.lg }]}>
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

        <Text style={styles.footer}>{'© 2026 MedAI · Tous droits réservés'}</Text>
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
  logo: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  subtitle: {
    ...fonts.body,
    marginTop: spacing.xs,
  },
  formSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  footer: {
    ...fonts.caption,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
