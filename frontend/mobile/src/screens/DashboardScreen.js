import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { getAnalyticsSummary } from '../api/api';
import Notifications from '../components/Notifications';

export default function DashboardScreen({ navigation }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getAnalyticsSummary().then((res) => setSummary(res.data)).catch(() => {});
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Dashboard</Text>
      {summary ? (
        <View>
          <Text>Total Patients: {summary.total_patients}</Text>
          <Text>Average Age: {summary.avg_age}</Text>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
      <Notifications />
      <Button title="View Patients" onPress={() => navigation.navigate('Patients')} />
    </View>
  );
}
