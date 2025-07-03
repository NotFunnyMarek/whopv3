// src/pages/Register.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../components/NotificationProvider';
import '../styles/register.scss';

const Register = () => {
  const { showNotification } = useNotifications();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    showNotification({ type: 'info', message: 'Registering...' });
    try {
      const res = await fetch('https://app.byxbot.com/php/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('authToken', 'loggedIn');
        localStorage.setItem('user', JSON.stringify({ id: data.user_id, username: form.username, email: form.email }));
        showNotification({ type: 'success', message: 'Registration successful.' });
        setTimeout(() => navigate('/'), 1000);
      } else {
        showNotification({ type: 'error', message: data.message || 'Registration error' });
      }
    } catch (err) {
      showNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Username
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait…' : 'Register'}
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
