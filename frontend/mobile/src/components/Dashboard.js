import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getAnalyticsSummary } from '../api/api';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAnalyticsSummary().then((res) => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>Total Patients: {data.total_patients}</Text>
      <Text>Average Age: {data.avg_age}</Text>
    </View>
  );
}
