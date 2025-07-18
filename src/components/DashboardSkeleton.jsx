import React from 'react';
import '../styles/dashboard-skeleton.scss';

export default function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="skeleton-line" style={{ width: '40%' }} />
      <div className="skeleton-box" />
      <div className="skeleton-box" />
    </div>
  );
}
