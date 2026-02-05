import React from 'react';
import { View, Text } from 'react-native';
import Analytics from '../components/Analytics';

export default function AnalyticsScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Analytics</Text>
      <Analytics />
    </View>
  );
}
