// src/pages/Register.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../components/NotificationProvider';
import TwoFactorCodeInput from '../components/TwoFactorCodeInput';
import '../styles/register.scss';
import logobuynback from '../assets/buynback.png'

const GOOGLE_CLIENT_ID = '477836153268-gmsf092g4nprn297cov055if8n66reel.apps.googleusercontent.com'; // replace with real client ID

const Register = () => {
  const { showNotification } = useNotifications();
  const [twofaToken, setTwofaToken] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState(null); // 'google' or 'email'
  const [resendTimer, setResendTimer] = useState(0);
  const [code, setCode] = useState(Array(6).fill(''));
  const navigate = useNavigate();

  useEffect(() => {
    if (twofaToken) return;

    const initGoogle = () => {
      if (!window.google) return false;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogle,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large' }
      );
      return true;
    };

    if (!initGoogle()) {
      const interval = setInterval(() => {
        if (initGoogle()) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [twofaToken]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleGoogle = async (resp) => {
    showNotification({ type: 'info', message: 'Processing...' });
    setIdToken(resp.credential);
    setMethod('google');
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
        setResendTimer(30);
        showNotification({ type: 'info', message: 'Verification code sent.' });
      } else {
        showNotification({ type: 'error', message: data.message || 'Error' });
      }
    } catch (err) {
      showNotification({ type: 'error', message: err.message });
    }
  };

  const handleEmail = async () => {
    if (!email.trim()) {
      showNotification({ type: 'error', message: 'Enter email' });
      return;
    }
    showNotification({ type: 'info', message: 'Processing...' });
    setIdToken(email.trim());
    setMethod('email');
    try {
      const res = await fetch('https://app.byxbot.com/php/google_start.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), mode: 'register' }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setTwofaToken(data.token);
        setResendTimer(30);
        showNotification({ type: 'info', message: 'Verification code sent.' });
      } else {
        showNotification({ type: 'error', message: data.message || 'Error' });
      }
    } catch (err) {
      showNotification({ type: 'error', message: err.message });
    }
  };

  const handleResend = async () => {
    if (!idToken) return;
    showNotification({ type: 'info', message: 'Resending code...' });
    try {
      const res = await fetch('https://app.byxbot.com/php/google_start.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(
          method === 'google'
            ? { id_token: idToken, mode: 'register' }
            : { email: idToken, mode: 'register' }
        ),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setTwofaToken(data.token);
        setResendTimer(30);
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
        body: JSON.stringify({ token: twofaToken, code: code.join('') }),
      });
      const data = await res.json();
      if (res.ok) {
        const username = data.user.username || data.user.email.split('@')[0];
        localStorage.setItem('authToken', 'loggedIn');
        localStorage.setItem('user', JSON.stringify({ ...data.user, username }));
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
        <img
    src={logobuynback}
    alt="Logo"
    className="auth-logo"
  />
        <h2>Sign up to Buy&Back</h2>
        {!twofaToken ? (
          <>
            <div className="auth-form">
              <input
                type="email"
                placeholder="join@buynback.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="button" className="btn-primary" onClick={handleEmail}>
                Continue
              </button>
            </div>
            <div id="google-btn" className="google-btn"></div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <label>2FA Code</label>
            <TwoFactorCodeInput value={code} onChange={setCode} />
            <button
              type="button"
              className="btn-resend"
              onClick={handleResend}
              disabled={resendTimer > 0}
            >
              {resendTimer > 0 ? `Resend (${resendTimer})` : 'Resend'}
            </button>
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
