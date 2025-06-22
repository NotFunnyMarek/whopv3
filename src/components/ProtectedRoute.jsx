// src/components/ProtectedRoute.jsx

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Protected route: if `localStorage.getItem('authToken')` exists, the user is considered authenticated.
 * Otherwise, redirect to /login.
 */
const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoggedIn(!!token);
    setChecking(false);
  }, []);

  if (checking) {
    return <div className="text-center">Checking session…</div>;
  }
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
