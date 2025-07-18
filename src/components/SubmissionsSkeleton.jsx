import React from 'react';
import '../styles/submissions-skeleton.scss';

export default function SubmissionsSkeleton() {
  return (
    <div className="submissions-skeleton">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton-box" />
      ))}
    </div>
  );
}
