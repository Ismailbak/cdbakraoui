import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getPatients } from '../api/api';

export default function PatientList() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    getPatients().then((res) => setPatients(res.data)).catch(() => {});
  }, []);

  return (
    <View>
      <FlatList
        data={patients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.name}</Text>
            <Text>{item.diagnosis}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No patients found</Text>}
      />
    </View>
  );
}
