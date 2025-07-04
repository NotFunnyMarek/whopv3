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
    async function verify() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoggedIn(false);
        setChecking(false);
        return;
      }

      try {
        const res = await fetch('https://app.byxbot.com/php/profile.php', {
          method: 'GET',
          credentials: 'include',
        });
        if (res.status === 401) {
          localStorage.removeItem('authToken');
          setLoggedIn(false);
        } else {
          setLoggedIn(true);
        }
      } catch {
        setLoggedIn(false);
      } finally {
        setChecking(false);
      }
    }

    verify();
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
