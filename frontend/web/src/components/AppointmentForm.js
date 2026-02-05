import React, { useState } from 'react';
import { createAppointment } from '../api/api';

function AppointmentForm({ onSuccess }) {
  const [form, setForm] = useState({
    patient_id: '',
    date: '',
    time: '',
    reason: '',
    status: 'scheduled'
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAppointment({ ...form, id: 0 });
    setForm({ patient_id: '', date: '', time: '', reason: '', status: 'scheduled' });
    if (onSuccess) onSuccess();
  };

  return (
    <div>
      <h3>New Appointment</h3>
      <form onSubmit={handleSubmit}>
        <input name="patient_id" placeholder="Patient ID" value={form.patient_id} onChange={handleChange} required />
        <input name="date" type="date" value={form.date} onChange={handleChange} required />
        <input name="time" type="time" value={form.time} onChange={handleChange} required />
        <input name="reason" placeholder="Reason" value={form.reason} onChange={handleChange} />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default AppointmentForm;
