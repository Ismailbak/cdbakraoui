import React, { useEffect, useState } from 'react';
import { getPatients } from '../api/api';

function PatientList({ onSelect }) {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    getPatients().then((res) => setPatients(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h3>Patients</h3>
      <ul>
        {patients.map((p) => (
          <li key={p.id} onClick={() => onSelect(p)}>{p.name} - {p.diagnosis}</li>
        ))}
      </ul>
    </div>
  );
}

export default PatientList;
