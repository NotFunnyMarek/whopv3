// src/pages/Login.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotifications } from '../components/NotificationProvider';
import '../styles/login.scss';

const GOOGLE_CLIENT_ID = '477836153268-gmsf092g4nprn297cov055if8n66reel.apps.googleusercontent.com'; // replace with real client ID

const Login = () => {
  const { showNotification } = useNotifications();
  const [twofaToken, setTwofaToken] = useState(null);
  const [digits, setDigits] = useState(Array(6).fill(''));
  const inputsRef = useRef([]);
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

  const handleDigitChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const arr = [...digits];
    arr[index] = value;
    setDigits(arr);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

const handleGoogle = async (resp) => {
  showNotification({ type: 'info', message: 'Processing...' });
  try {
    const res = await fetch('https://app.byxbot.com/php/google_start.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id_token: resp.credential }),
    });
    if (res.status === 404) {
      navigate('/register');
      return;
    }
    const data = await res.json();
    if (res.ok && data.token) {
      setTwofaToken(data.token);
      showNotification({ type: 'info', message: 'Verification code sent.' });
    } else {
      showNotification({ type: 'error', message: data.message || 'Login error' });
    }
  } catch (err) {
    showNotification({ type: 'error', message: err.message });
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join('');
    try {
      const res = await fetch('https://app.byxbot.com/php/verify_code.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: twofaToken, code }),
      });
      const data = await res.json();
      if (res.ok) {
        const username = data.user.username || data.user.email.split('@')[0];
        localStorage.setItem('authToken', 'loggedIn');
        localStorage.setItem('user', JSON.stringify({ ...data.user, username }));
        showNotification({ type: 'success', message: 'Login successful.' });
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
        <h2>Login</h2>
        {!twofaToken ? (
          <div id="google-btn" className="google-btn"></div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <label>
              2FA Code
              <div className="code-inputs">
                {digits.map((d, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    required
                  />
                ))}
              </div>
            </label>
            <button type="submit" className="btn-primary">Verify</button>
          </form>
        )}
        <p className="switch-link">
          Don’t have an account? <Link to="/register">Go to Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
