import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#0A66C2',
  primaryDark: '#004182',
  primaryLight: '#E8F1FB',
  accent: '#00B4D8',
  background: '#F7F9FC',
  surface: '#FFFFFF',
  textPrimary: '#1A202C',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  error: '#E53E3E',
  success: '#38A169',
  warning: '#ED8936',
  inputBg: '#F1F5F9',
};

export const fonts = {
  heading: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
  subheading: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 13, fontWeight: '400', color: colors.textMuted },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
