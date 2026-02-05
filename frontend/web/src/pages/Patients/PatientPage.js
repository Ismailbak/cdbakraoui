import React, { useState } from 'react';
import PatientList from '../../components/PatientList';
import PatientForm from '../../components/PatientForm';
import Chat from '../../components/Chat';

function PatientPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const handleSuccess = () => {
    setRefresh(refresh + 1);
  };

  return (
    <div>
      <h2>Patients</h2>
      <PatientForm onSuccess={handleSuccess} />
      <PatientList key={refresh} onSelect={setSelectedPatient} />
      {selectedPatient && (
        <div>
          <h3>Selected: {selectedPatient.name}</h3>
          <Chat patientId={selectedPatient.id} />
        </div>
      )}
    </div>
  );
}

export default PatientPage;
