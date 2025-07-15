// src/pages/Register.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../components/NotificationProvider';
import TwoFactorCodeInput from '../components/TwoFactorCodeInput';
import '../styles/register.scss';
import logobuynback from '../assets/buynback.png'
import countries from '../utils/countries';

const GOOGLE_CLIENT_ID = '477836153268-gmsf092g4nprn297cov055if8n66reel.apps.googleusercontent.com'; // replace with real client ID

const Register = () => {
  const { showNotification } = useNotifications();
  const { login } = useAuth();
  const [twofaToken, setTwofaToken] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState(null); // 'google' or 'email'
  const [resendTimer, setResendTimer] = useState(0);
  const [code, setCode] = useState(Array(6).fill(''));
  const [step, setStep] = useState('start'); // start -> info -> code
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');
  const [agree, setAgree] = useState(false);
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
    setIdToken(resp.credential);
    setMethod('google');
    setStep('info');
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
      const check = await fetch('https://app.byxbot.com/php/check_email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const checkData = await check.json();
      if (check.ok && checkData.exists) {
        showNotification({ type: 'error', message: 'Email already registered, please login' });
        return;
      }
      setStep('info');
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

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (!dob || !country || !agree) {
      showNotification({ type: 'error', message: 'Please complete all fields' });
      return;
    }
    const age = (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 13) {
      showNotification({ type: 'error', message: 'You must be at least 13 years old' });
      return;
    }
    try {
      let token = twofaToken;
      if (!token) {
        const start = await fetch('https://app.byxbot.com/php/google_start.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(
            method === 'google'
              ? { id_token: idToken, mode: 'register' }
              : { email: idToken, mode: 'register' }
          ),
        });
        const startData = await start.json();
        if (start.ok && startData.token) {
          setTwofaToken(startData.token);
          setResendTimer(30);
          token = startData.token;
          showNotification({ type: 'info', message: 'Verification code sent.' });
        } else {
          showNotification({ type: 'error', message: startData.message || 'Error' });
          return;
        }
      }

      const res = await fetch('https://app.byxbot.com/php/update_registration.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          token,
          date_of_birth: dob,
          country,
          accepted_terms: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setStep('code');
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
        login();
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
        {step === 'start' ? (
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
        ) : step === 'info' ? (
          <form onSubmit={handleInfoSubmit} className="auth-form">
            <label>Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
            <label>Country</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} required>
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
              />
              <span className='tosc'>
                I agree to the{' '}
                <a href="/tos" target="_blank" rel="noreferrer">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" rel="noreferrer">
                  Privacy Policy
                </a>
              </span>
            </label>
            <button type="submit" className="btn-primary">
              Continue
            </button>
          </form>
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
