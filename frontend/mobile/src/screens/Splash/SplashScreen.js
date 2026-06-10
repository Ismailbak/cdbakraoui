import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PhoneShell, { LogoMark } from '../../components/common/PhoneShell';
import { colors, fonts, spacing } from '../../styles/theme';

export default function SplashScreen({ onFinish }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
      Animated.delay(1740),
      Animated.parallel([
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.72,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: -118,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onFinish?.());
  }, [logoOpacity, logoScale, logoTranslateY, onFinish, screenOpacity, textOpacity]);

  return (
    <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
      <PhoneShell scroll={false} center panelStyle={styles.panel} contentStyle={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }, { scale: logoScale }],
            },
          ]}
        >
          <LogoMark size={86} compact />
        </Animated.View>
        <Animated.View style={[styles.copyBlock, { opacity: textOpacity }]}>
          <Text style={styles.title}>Soignez mieux, gérez plus simplement.</Text>
          <Text style={styles.subtitle}>Votre assistant médical pensé pour la dentisterie - Centre Dentaire Bakraoui.</Text>
        </Animated.View>
        <LinearGradient
          colors={['rgba(246,247,248,0)', 'rgba(10,74,79,0.36)']}
          style={styles.fade}
        />
        <Animated.Text style={[styles.caption, { opacity: textOpacity }]}>Chargement sécurisé...</Animated.Text>
      </PhoneShell>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  panel: {
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginTop: -spacing.xxl,
  },
  copyBlock: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  title: {
    color: colors.mobileText,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subtitle: {
    ...fonts.caption,
    color: colors.mobileMuted,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 240,
  },
  caption: {
    ...fonts.caption,
    position: 'absolute',
    bottom: spacing.lg,
    color: colors.mobilePrimaryDark,
    fontWeight: '800',
  },
});
