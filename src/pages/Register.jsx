// src/pages/Register.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../components/NotificationProvider';
import '../styles/register.scss';

const Register = () => {
  const { showNotification } = useNotifications();
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    showNotification({ type: 'info', message: 'Registering...' });
    try {
      const res = await fetch('https://app.byxbot.com/php/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        showNotification({ type: 'success', message: data.message || 'Registration successful. Please log in.' });
        setUsername('');
        setEmail('');
        setPassword('');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        let errText = `Registration error (HTTP ${res.status})`;
        try {
          const errJson = await res.json();
          if (errJson.message) errText = errJson.message;
        } catch {}
        showNotification({ type: 'error', message: errText });
      }
    } catch (err) {
      showNotification({ type: 'error', message: 'Error: ' + err.message });
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password (min. 6 characters)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <button type="submit" className="btn-primary">
            Sign Up
          </button>
        </form>
        <p className="switch-link">
          Already have an account? <Link to="/login">Go to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
