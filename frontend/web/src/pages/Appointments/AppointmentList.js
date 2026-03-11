import React, { useEffect, useState } from 'react';
import { getAppointments, deleteAppointment } from '../../api/api';

function AppointmentList({ onSelect }) {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    getAppointments().then((res) => setAppointments(res.data)).catch(() => {});
  };

  const handleDelete = async (id) => {
    await deleteAppointment(id);
    loadAppointments();
  };

  return (
    <div>
      <h3>Appointments (Rendez-vous)</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Patient</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr key={apt.id}>
              <td>{apt.date}</td>
              <td>{apt.time}</td>
              <td>{apt.patient_name || apt.patient_id}</td>
              <td>{apt.reason}</td>
              <td>{apt.status}</td>
              <td>
                <button onClick={() => onSelect && onSelect(apt)}>View</button>
                <button onClick={() => handleDelete(apt.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {appointments.length === 0 && <p>No appointments found</p>}
    </div>
  );
}

export default AppointmentList;
