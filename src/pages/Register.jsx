// src/pages/Register.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/register.scss';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [message,  setMessage]  = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Registruji...');
    try {
      const res = await fetch('https://app.byxbot.com/php/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(data.message || 'Registrace proběhla úspěšně. Přihlaste se.');
        setUsername('');
        setEmail('');
        setPassword('');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        // Zkusíme přečíst chybovou JSON odpověď, pokud existuje
        let errText = `Chyba při registraci (HTTP ${res.status})`;
        try {
          const errJson = await res.json();
          if (errJson.message) errText = errJson.message;
        } catch {}
        setMessage(errText);
      }
    } catch (err) {
      setMessage('Chyba: ' + err.message);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Registrace</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <label>
            Uživatelské jméno
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Heslo (min. 6 znaků)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <button type="submit" className="btn-primary">
            Registrovat
          </button>
        </form>
        <p className="message">{message}</p>
        <p className="switch-link">
          Už máte účet? <Link to="/login">Přejít na přihlášení</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
