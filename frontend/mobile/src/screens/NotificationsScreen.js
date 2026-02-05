import React from 'react';
import { View, Text } from 'react-native';
import Notifications from '../components/Notifications';

export default function NotificationsScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Notifications</Text>
      <Notifications />
    </View>
  );
}
