import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.scss';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message,  setMessage]  = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Přihlašuji...');
    try {
      const res = await fetch('https://app.byxbot.com/php/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',   // DŮLEŽITÉ: zajistí uložení PHPSESSID cookie
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        let data = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }
        // Uložíme do localStorage příznak i data uživatele
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

        setMessage('Přihlášení proběhlo úspěšně.');
        setUsername('');
        setPassword('');
        setTimeout(() => navigate('/'), 1000);
      } else if (res.status === 401) {
        setMessage('Špatné jméno nebo heslo.');
      } else {
        setMessage(`Chyba při přihlášení (HTTP ${res.status}).`);
      }
    } catch (err) {
      setMessage('Síťová chyba: ' + err.message);
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
        <p className="message">{message}</p>
        <p className="switch-link">
          Nemáte účet? <Link to="/register">Přejít na registraci</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
