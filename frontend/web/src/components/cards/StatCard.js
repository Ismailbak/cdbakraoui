import React from 'react';
import './StatCard.css';

function StatCard({ icon, label, percentage, value, color = 'pink' }) {
  const colorClasses = {
    pink: 'stat-card-pink',
    blue: 'stat-card-blue',
    green: 'stat-card-green',
    yellow: 'stat-card-yellow',
    purple: 'stat-card-purple',
  };

  return (
    <div className={`stat-card ${colorClasses[color]}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-percentage">{percentage}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export default StatCard;
