import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { colors } from '../styles/theme';

import LoginScreen from '../screens/Login/LoginScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import PatientScreen from '../screens/Patients/PatientScreen';
import PatientDetailScreen from '../screens/Patients/PatientDetailScreen';
import AddMedicalActScreen from '../screens/Patients/AddMedicalActScreen';
import AppointmentsScreen from '../screens/Appointments/AppointmentsScreen';
import AnalyticsScreen from '../screens/Analytics/AnalyticsScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import ChatAssistantScreen from '../screens/Assistant/ChatAssistantScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const PatientStack = createNativeStackNavigator();

function TabIcon({ label }) {
  const icons = {
    Dashboard: '🏠',
    Patients: '👥',
    Appointments: '📅',
    Chat: '🤖',
    More: '⚙️',
  };
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 22 }}>{icons[label] || '📋'}</Text>
    </View>
  );
}

// ─── Patient Stack (List → Detail → AddMedicalAct) ──────────────────────────
function PatientStackNavigator() {
  return (
    <PatientStack.Navigator screenOptions={{ headerShown: false }}>
      <PatientStack.Screen name="PatientList" component={PatientScreen} />
      <PatientStack.Screen name="PatientDetail" component={PatientDetailScreen} />
      <PatientStack.Screen name="AddMedicalAct" component={AddMedicalActScreen} />
    </PatientStack.Navigator>
  );
}

// ─── Bottom Tabs ─────────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: () => <TabIcon label={route.name} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="Patients" component={PatientStackNavigator} options={{ tabBarLabel: 'Patients' }} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{ tabBarLabel: 'RDV' }} />
      <Tab.Screen name="Chat" component={ChatAssistantScreen} options={{ tabBarLabel: 'Assistant' }} />
      <Tab.Screen name="More" component={MoreStackNavigator} options={{ tabBarLabel: 'Plus' }} />
    </Tab.Navigator>
  );
}

// ─── "More" Stack (Analytics, Notifications, Settings) ───────────────────────
const MoreStack = createNativeStackNavigator();

function MoreScreen({ navigation }) {
  const items = [
    { icon: '📊', label: 'Statistiques', screen: 'Analytics' },
    { icon: '🔔', label: 'Notifications', screen: 'Notifications' },
    { icon: '⚙️', label: 'Paramètres', screen: 'Settings' },
  ];

  return (
    <View style={{
      flex: 1, backgroundColor: colors.background,
      paddingTop: 60, paddingHorizontal: 24,
    }}>
      <Text style={{
        fontSize: 26, fontWeight: '700',
        color: colors.textPrimary, marginBottom: 24,
      }}>
        {'Plus'}
      </Text>
      {items.map((item) => (
        <View
          key={item.screen}
          style={{
            backgroundColor: colors.surface, borderRadius: 12,
            padding: 16, marginBottom: 10,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
          }}
        >
          <Text
            style={{ fontSize: 16, color: colors.textPrimary, fontWeight: '500' }}
            onPress={() => navigation.navigate(item.screen)}
          >
            {item.icon + '   ' + item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="MoreMenu" component={MoreScreen} />
      <MoreStack.Screen name="Analytics" component={AnalyticsScreen} />
      <MoreStack.Screen name="Notifications" component={NotificationsScreen} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} />
    </MoreStack.Navigator>
  );
}

// ─── Root Stack ──────────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}
