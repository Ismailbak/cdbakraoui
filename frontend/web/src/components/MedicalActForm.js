import React, { useState } from 'react';
import { createMedicalAct } from '../api/api';

function MedicalActForm({ onSuccess }) {
  const [form, setForm] = useState({
    patient_id: '',
    act_type: 'consultation',
    description: '',
    date: '',
    notes: '',
    status: 'completed'
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMedicalAct({ ...form, id: 0 });
    setForm({ patient_id: '', act_type: 'consultation', description: '', date: '', notes: '', status: 'completed' });
    if (onSuccess) onSuccess();
  };

  return (
    <div>
      <h3>New Medical Act</h3>
      <form onSubmit={handleSubmit}>
        <input name="patient_id" placeholder="Patient ID" value={form.patient_id} onChange={handleChange} required />
        <select name="act_type" value={form.act_type} onChange={handleChange}>
          <option value="consultation">Consultation</option>
          <option value="examination">Examination</option>
          <option value="procedure">Procedure</option>
          <option value="follow-up">Follow-up</option>
          <option value="emergency">Emergency</option>
        </select>
        <input name="date" type="date" value={form.date} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default MedicalActForm;
