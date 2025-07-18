import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/page-loader.scss';
import logo from './../assets/load.png'

export default function PageLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timeout);
  }, [location]);

  if (!loading) return null;
  return (
    <div className="page-loader">
      <img
        src={logo} // nahraď správnou cestou
        alt="Loading..."
        className="page-loader__image"
      />
    </div>
  );
}
