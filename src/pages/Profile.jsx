// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/profile.scss';

const Profile = () => {
  const navigate = useNavigate();

  // Stav formuláře a zpráv
  const [form, setForm] = useState({
    name: '',
    bio: '',
    username: '',
    email: '',
    phone: '',
    showJoined: false,
    showOwned: false,
    showLocation: false,
  });
  const [initialForm, setInitialForm] = useState(null); // pro porovnání, zda se něco změnilo
  const [message, setMessage] = useState('');   // úspěšná hláška
  const [error, setError] = useState('');       // chybová hláška
  const [isDirty, setIsDirty] = useState(false); // true, pokud se liší aktuální form od initialForm

  // Po prvním vykreslení načteme data GETem
  useEffect(() => {
    fetch('https://app.byxbot.com/php/profile.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then(res => {
        if (res.status === 401) {
          navigate('/login');
          return null;
        }
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        if (data.status === 'success') {
          const loaded = {
            name: data.data.name || '',
            bio: data.data.bio || '',
            username: data.data.username || '',
            email: data.data.email || '',
            phone: data.data.phone || '',
            showJoined: false,
            showOwned: false,
            showLocation: false,
          };
          setForm(loaded);
          setInitialForm(loaded); // uložíme původní hodnoty
          setIsDirty(false);      // zatím bez změn
        } else {
          setError('Chyba při načítání: ' + (data.message || ''));
        }
      })
      .catch(err => {
        console.error('Chyba při načítání profilu:', err);
        setError('Nepodařilo se načíst profil.');
      });
  }, [navigate]);

  // Detekce změny pole => odstranění předchozích hlášek a nastavení isDirty
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError('');
    setMessage('');
    setForm(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // Porovnání s initialForm pro detekci "dirty"
      if (initialForm) {
        const dirtyNow = 
          updated.name !== initialForm.name ||
          updated.bio !== initialForm.bio ||
          updated.username !== initialForm.username ||
          updated.email !== initialForm.email ||
          updated.phone !== initialForm.phone;
        setIsDirty(dirtyNow);
      } else {
        setIsDirty(true);
      }

      return updated;
    });
  };

  // Odeslání formuláře (POST)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('Ukládám...');

    const payload = {
      name: form.name,
      bio: form.bio,
      username: form.username,
      email: form.email,
      phone: form.phone,
    };

    fetch('https://app.byxbot.com/php/profile.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (res.status === 401) {
          navigate('/login');
          return null;
        }
        if (res.status === 400) {
          return res.json();
        }
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.text();
      })
      .then(result => {
        if (result === null) return; // už přesměrováno

        // Pokud JSON s chybou (HTTP 400)
        if (typeof result === 'object' && result.status === 'error') {
          setError(result.message);
          setMessage('');
          return;
        }

        // Pokud prázdné tělo => úspěch
        if (typeof result === 'string') {
          const trimmed = result.trim();
          if (trimmed === '') {
            setMessage('Vše bylo úspěšně uloženo.');
            setError('');
            // aktualizujeme initialForm
            setInitialForm({ ...form });
            setIsDirty(false);
            return;
          }
          // Pokus parsovat JSON
          try {
            const data = JSON.parse(trimmed);
            if (data.status === 'success') {
              setMessage('Vše bylo úspěšně uloženo.');
              setError('');
              setInitialForm({ ...form });
              setIsDirty(false);
            } else {
              setError(data.message || 'Neznámá chyba při ukládání');
              setMessage('');
            }
          } catch {
            // Neplatný JSON, ale považujeme to za úspěch
            setMessage('Vše bylo úspěšně uloženo.');
            setError('');
            setInitialForm({ ...form });
            setIsDirty(false);
          }
        }
      })
      .catch(err => {
        console.error('Chyba při ukládání profilu:', err);
        setError('Chyba při ukládání profilu.');
        setMessage('');
      });
  };

  // Odhlášení
  const handleLogout = () => {
    fetch('https://app.byxbot.com/php/logout.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    })
      .then(res => {
        if (res.ok) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          navigate('/login');
        }
      })
      .catch(err => console.error('Logout chyba:', err));
  };

  return (
    <div className="profile-container">
      <h2>Account settings</h2>

      {/* Chybová / úspěšná hláška */}
      {error && <p className="profile-error">{error}</p>}
      {message && !error && <p className="profile-success">{message}</p>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-left">
          <img
            src={'https://via.placeholder.com/100'}
            alt="avatar"
            className="profile-avatar"
          />
          <h3>{form.name || 'Uživatel'}</h3>
          <p className="profile-sub">@{form.username || ''}</p>
          <button
            type="button"
            className="btn-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="profile-right">
          <label>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </label>

          <label>
            Bio
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="No bio"
            />
          </label>

          <label>
            Username
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              disabled
              style={{ backgroundColor: '#f0f0f0', color: '#888' }}
            />
          </label>

          <label>
            Phone number
            <div className="phone-input">
              <span>🇨🇿</span>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+420____"
              />
            </div>
          </label>

          <p className="section-title">
            What can people see in your profile?
          </p>
          <label className="checkbox-label">
            Joined whops
            <input
              type="checkbox"
              name="showJoined"
              checked={form.showJoined}
              onChange={handleChange}
            />
          </label>
          <label className="checkbox-label">
            Owned whops
            <input
              type="checkbox"
              name="showOwned"
              checked={form.showOwned}
              onChange={handleChange}
            />
          </label>
          <label className="checkbox-label">
            Approximate location
            <input
              type="checkbox"
              name="showLocation"
              checked={form.showLocation}
              onChange={handleChange}
            />
          </label>

          <button
            type="submit"
            className="btn-save"
            disabled={!isDirty}  /* Zneaktivníme Save, pokud nejsou žádné změny */
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
