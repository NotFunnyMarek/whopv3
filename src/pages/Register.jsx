// src/pages/Register.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../components/NotificationProvider';
import '../styles/register.scss';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  '477836153268-gmsf092g4nprn297cov055if8n66reel.apps.googleusercontent.com';

const Register = () => {
  const { showNotification } = useNotifications();
  const [twofaToken, setTwofaToken] = useState(null);
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (window.google && !twofaToken) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogle,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large' }
      );
    }
  }, [twofaToken]);

  const handleGoogle = async (resp) => {
    showNotification({ type: 'info', message: 'Processing...' });
    try {
      const res = await fetch('https://app.byxbot.com/php/google_start.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id_token: resp.credential, mode: 'register' }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setTwofaToken(data.token);
        showNotification({ type: 'info', message: 'Verification code sent.' });
      } else {
        showNotification({ type: 'error', message: data.message || 'Error' });
      }
    } catch (err) {
      showNotification({ type: 'error', message: err.message });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://app.byxbot.com/php/verify_code.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: twofaToken, code }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('authToken', 'loggedIn');
        localStorage.setItem('user', JSON.stringify(data.user));
        showNotification({ type: 'success', message: 'Registration complete.' });
        setTimeout(() => navigate('/'), 1000);
      } else {
        showNotification({ type: 'error', message: data.message || 'Invalid code' });
      }
    } catch (err) {
      showNotification({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Register</h2>
        {!twofaToken ? (
          <div id="google-btn" className="google-btn"></div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              2FA Code
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
              />
            </label>
            <button type="submit" className="btn-primary">Verify</button>
          </form>
        )}
        <p className="switch-link">
          Already have an account? <Link to="/login">Go to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
