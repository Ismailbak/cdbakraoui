import React, { useEffect, useState } from 'react';
import { getPatients } from '../../api/api';

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
          <li key={p.id} onClick={() => onSelect(p)}>{p.first_name} {p.last_name} - {p.primary_diagnosis}</li>
        ))}
      </ul>
    </div>
  );
}

export default PatientList;
