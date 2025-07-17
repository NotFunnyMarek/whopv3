import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/page-loader.scss';

export default function PageLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timeout);
  }, [location]);

  if (!loading) return null;
  return (
    <div className="page-loader">
      <div className="spinner" />
    </div>
  );
}
