import React, { useEffect, useState } from 'react';
import { getAnalyticsSummary } from '../api/api';

function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getAnalyticsSummary().then((res) => setSummary(res.data)).catch(() => {});
  }, []);

  if (!summary) return <div>Loading...</div>;

  return (
    <div>
      <h3>Dashboard</h3>
      <p>Total Patients: {summary.total_patients}</p>
      <p>Average Age: {summary.avg_age}</p>
      <p>Common Diagnoses: {summary.common_diagnoses.join(', ') || 'N/A'}</p>
    </div>
  );
}

export default Dashboard;
