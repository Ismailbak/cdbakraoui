import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getNotifications } from '../api/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications().then((res) => setNotifications(res.data)).catch(() => {});
  }, []);

  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={{ fontWeight: 'bold' }}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 5 }}>
            <Text>{item.title}: {item.message}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No notifications</Text>}
      />
    </View>
  );
}
