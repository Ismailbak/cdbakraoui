import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatient } from '../../api/api';
import ChatSessions from '../Assistant/components/ChatSessions';
import './ChatPage.css';

const ChatPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const response = await getPatient(patientId);
      setPatient(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load patient information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!patientId) {
    return (
      <div className="chat-page">
        <div className="no-patient">
          <p>Please select a patient to start chatting</p>
          <button onClick={() => navigate('/patients')} className="btn-back">
            Go to Patients
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="chat-page">
        <div className="loading">Loading patient information...</div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Back
        </button>
        <div className="patient-info">
          <h1>Chat Assistant</h1>
          {patient && (
            <p className="patient-name">
              Patient: {patient.first_name} {patient.last_name}
            </p>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="chat-content">
        {patient && <ChatSessions patientId={patientId} />}
      </div>
    </div>
  );
};

export default ChatPage;
