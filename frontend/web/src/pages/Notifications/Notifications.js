import React, { useEffect, useState } from 'react';
import { getNotifications } from '../../api/api';

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications().then((res) => setNotifications(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h3>Notifications</h3>
      <ul>
        {notifications.map((n) => (
          <li key={n.id}>{n.title}: {n.message}</li>
        ))}
      </ul>
      {notifications.length === 0 && <p>No notifications</p>}
    </div>
  );
}

export default Notifications;
