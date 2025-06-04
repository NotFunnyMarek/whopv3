import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Zabezpečená routa: pokud `localStorage.getItem('authToken')` existuje, považuje se uživatel za přihlášeného.
 * Pokud ne, přesměruje na /login.
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
    return <div className="centered">Kontrola relace…</div>;
  }
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
