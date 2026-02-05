import React, { useState } from 'react';
import { createPatient } from '../api/api';

function PatientForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    age: '',
    diagnosis: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createPatient({ ...form, id: 0, age: parseInt(form.age) });
    setForm({ name: '', age: '', diagnosis: '' });
    if (onSuccess) onSuccess();
  };

  return (
    <div>
      <h3>New Patient</h3>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} required />
        <input name="diagnosis" placeholder="Diagnosis" value={form.diagnosis} onChange={handleChange} />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default PatientForm;
