import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/page-loader.scss';
import logo from './../assets/load.png';
import { useLoading } from '../context/LoadingContext';

export default function PageLoader() {
  const location = useLocation();
  const { loading, showLoader, hideLoader } = useLoading();

  useEffect(() => {
    showLoader();
    const timeout = setTimeout(() => hideLoader(), 300);
    return () => clearTimeout(timeout);
  }, [location, showLoader, hideLoader]);

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
