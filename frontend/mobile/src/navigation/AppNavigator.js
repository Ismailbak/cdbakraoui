import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { colors, spacing } from '../styles/theme';

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
import MoreMenuItemButton from '../components/navigation/MoreMenuItemButton';
import PhoneShell, { ScreenHeader } from '../components/common/PhoneShell';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const PatientStack = createNativeStackNavigator();

/**
 * Tab Icon Component - Uses Feather Icons from Expo
 * Shown inactive (#9CA3AF) by default, active (#3B82F6) when selected
 */
function TabIcon({ name, label, color }) {
  return <Feather name={name} size={32} color={color} />;
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

// ─── Bottom Tabs with Premium Styling ────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, focused }) => {
          const iconMap = {
            Dashboard: 'home',
            Patients: 'users',
            ChatTab: 'message-circle',
            Appointments: 'calendar',
            More: 'more-horizontal',
          };
          return <TabIcon name={iconMap[route.name]} label={route.name} color={color} />;
        },
        tabBarActiveTintColor: colors.mobilePrimary,
        tabBarInactiveTintColor: colors.mobileMuted,
        tabBarStyle: {
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: 14,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 14,
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
          paddingHorizontal: spacing.xs,
          borderRadius: 24,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="Patients" component={PatientStackNavigator} options={{ tabBarLabel: 'Patients' }} />
      <Tab.Screen
        name="ChatTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Assistant' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.getParent()?.navigate('Chat');
          },
        })}
      />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{ tabBarLabel: 'RDV' }} />
      <Tab.Screen name="More" component={MoreStackNavigator} options={{ tabBarLabel: 'Plus' }} />
    </Tab.Navigator>
  );
}

// ─── "More" Screen - Clean Menu ───────────────────────────────────────────────
function MoreScreen({ navigation }) {
  const items = [
    { icon: 'bar-chart-2', label: 'Statistiques', screen: 'Analytics' },
    { icon: 'bell', label: 'Notifications', screen: 'Notifications' },
    { icon: 'settings', label: 'Paramètres', screen: 'Settings' },
  ];

  return (
    <PhoneShell contentStyle={styles.moreContainer}>
      <ScreenHeader title="Plus" />
      <View style={styles.moreMenuList}>
        {items.map((item) => (
          <MoreMenuItemButton
            key={item.screen}
            icon={item.icon}
            label={item.label}
            onPress={() => navigation.navigate(item.screen)}
          />
        ))}
      </View>
    </PhoneShell>
  );
}

// ─── "More" Stack (Analytics, Notifications, Settings) ───────────────────────
const MoreStack = createNativeStackNavigator();

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
      <Stack.Screen name="Chat" component={ChatAssistantScreen} />
    </Stack.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  moreContainer: {
    paddingBottom: 90,
  },
  moreMenuList: {
    gap: spacing.sm,
  },
});
