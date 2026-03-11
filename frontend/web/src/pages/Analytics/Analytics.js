import React, { useEffect, useState } from 'react';
import { getAnalyticsSummary } from '../../api/api';

function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAnalyticsSummary().then((res) => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return <div>Loading analytics...</div>;

  return (
    <div>
      <h3>Analytics</h3>
      <p>Total Patients: {data.total_patients}</p>
      <p>Average Age: {data.avg_age}</p>
    </div>
  );
}

export default Analytics;
