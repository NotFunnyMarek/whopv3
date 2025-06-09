// src/pages/Login.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../components/NotificationProvider';
import '../styles/login.scss';

const Login = () => {
  const { showNotification } = useNotifications();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    showNotification({ type: 'info', message: 'Přihlašuji...' });
    try {
      const res = await fetch('https://app.byxbot.com/php/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        let data = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }
        localStorage.setItem('authToken', 'loggedIn');
        const userObj = {
          id: data.user?.id || null,
          username: data.user?.username || username,
          email: data.user?.email || '',
          name: data.user?.username || username,
          bio: '',
          phone: ''
        };
        localStorage.setItem('user', JSON.stringify(userObj));
        showNotification({ type: 'success', message: 'Přihlášení proběhlo úspěšně.' });
        setUsername('');
        setPassword('');
        setTimeout(() => navigate('/'), 1000);
      } else if (res.status === 401) {
        showNotification({ type: 'error', message: 'Špatné jméno nebo heslo.' });
      } else {
        showNotification({ type: 'error', message: `Chyba při přihlášení (HTTP ${res.status}).` });
      }
    } catch (err) {
      showNotification({ type: 'error', message: 'Síťová chyba: ' + err.message });
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Přihlášení</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Uživatelské jméno nebo e-mail
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Heslo
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn-primary">
            Přihlásit
          </button>
        </form>
        <p className="switch-link">
          Nemáte účet? <Link to="/register">Přejít na registraci</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
