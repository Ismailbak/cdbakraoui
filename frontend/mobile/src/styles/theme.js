import { StyleSheet } from 'react-native';

/**
 * PREMIUM Design System
 * Aligned with Web Dashboard aesthetic
 * Slate/Indigo palette with accent categories
 */

export const colors = {
  // Mobile remodel palette
  mobileBackground: '#0A4A4F',
  mobilePanel: '#F6F7F8',
  mobilePrimary: '#238C96',
  mobilePrimaryDark: '#0F6870',
  mobileText: '#303236',
  mobileMuted: '#8B8F96',
  mobileDivider: '#E4E6E8',

  // Core Background & Surfaces
  background: '#f5f7fa',
  surface: '#ffffff',
  
  // Text Hierarchy
  textPrimary: '#1E2A4A',      // Gris-bleu très foncé for headings
  textSecondary: '#374151',    // Medium gray for body copy
  textMuted: '#6B7280',        // Light gray for labels
  textMutedLight: '#9CA3AF',   // Lighter gray for captions
  
  // Primary (Blue - Default actions)
  primary: '#3B82F6',
  primaryDark: '#1E40AF',
  primaryLight: '#DBEAFE',
  
  // Category Accent Colors
  rdv: '#3B82F6',                    // Rendez-vous (Light Blue)
  rdvLight: '#EFF6FF',
  
  actes: '#8B5CF6',                  // Actes Médicaux (Indigo/Violet)
  actesLight: '#F3E8FF',
  
  patient: '#4F46E5',                // Patient (Deep Indigo)
  patientLight: '#E0E7FF',
  
  appointmentSuccess: '#059669',     // Appointment Confirmed (Emerald)
  appointmentSuccessLight: '#D1FAE5',
  
  // Status Colors
  error: '#DC2626',
  errorLight: '#FEE2E2',
  
  success: '#059669',
  successLight: '#D1FAE5',
  
  warning: '#D97706',
  warningLight: '#FEF3C7',
  
  // Special Gradients
  aiGradientStart: '#FEE2E2',   // Rose pastel (red-100)
  aiGradientEnd: '#FCE7F3',     // Rose pastel (pink-100)
  
  // UI Elements
  border: '#E5E7EB',
  inputBg: '#F9FAFB',
  divider: '#F3F4F6',
};

export const fonts = {
  heading: { 
    fontSize: 36, 
    fontWeight: '700', 
    color: colors.textPrimary,
    lineHeight: 42
  },
  subheading: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: colors.textPrimary,
    lineHeight: 24
  },
  body: { 
    fontSize: 15, 
    fontWeight: '400', 
    color: colors.textSecondary,
    lineHeight: 20
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 18
  },
  caption: { 
    fontSize: 13, 
    fontWeight: '400', 
    color: colors.textMuted,
    lineHeight: 16
  },
  label: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 14
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const shadows = {
  // Soft card shadow (web-aligned)
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  // Elevated shadow for floating elements
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  // None/minimal shadow
  none: {
    shadowColor: 'transparent',
    elevation: 0,
  },
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,      // NEW: Primary card radius (was 16 before, now explicit)
  xl: 20,
  xxl: 24,
  full: 999,
};
