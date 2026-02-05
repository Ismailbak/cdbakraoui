import React from 'react';
import { View, Text } from 'react-native';
import PatientList from '../components/PatientList';

export default function PatientScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Patients</Text>
      <PatientList />
    </View>
  );
}
