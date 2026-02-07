import React from 'react';
import './Skeleton.css';

// Basic skeleton element
export function Skeleton({ width, height, borderRadius = '8px', className = '' }) {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}

// Skeleton for stat cards on dashboard
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-header">
        <Skeleton width="50px" height="50px" borderRadius="12px" />
        <div className="skeleton-card-text">
          <Skeleton width="80px" height="14px" />
          <Skeleton width="60px" height="28px" />
        </div>
      </div>
      <Skeleton width="100%" height="12px" className="skeleton-mt" />
    </div>
  );
}

// Skeleton for table rows
export function SkeletonTableRow({ columns = 5 }) {
  return (
    <tr className="skeleton-table-row">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <Skeleton 
            width={i === 0 ? '150px' : i === columns - 1 ? '80px' : '100px'} 
            height="16px" 
          />
        </td>
      ))}
    </tr>
  );
}

// Skeleton for patient/appointment list items
export function SkeletonListItem() {
  return (
    <div className="skeleton-list-item">
      <Skeleton width="45px" height="45px" borderRadius="50%" />
      <div className="skeleton-list-content">
        <Skeleton width="140px" height="16px" />
        <Skeleton width="100px" height="14px" />
      </div>
      <Skeleton width="70px" height="24px" borderRadius="12px" />
    </div>
  );
}

// Skeleton for chart
export function SkeletonChart({ height = '300px' }) {
  return (
    <div className="skeleton-chart" style={{ height }}>
      <div className="skeleton-chart-bars">
        {Array.from({ length: 7 }).map((_, i) => (
          <div 
            key={i} 
            className="skeleton-bar"
            style={{ height: `${30 + Math.random() * 50}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Full page loading spinner
export function LoadingSpinner({ size = 'medium', text = 'Chargement...' }) {
  return (
    <div className={`loading-spinner-container ${size}`}>
      <div className="loading-spinner"></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

// Inline button spinner
export function ButtonSpinner() {
  return <span className="button-spinner"></span>;
}

export default Skeleton;
