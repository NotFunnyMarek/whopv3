// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import '../styles/profile.scss';

const Profile = () => {
  const navigate = useNavigate();

  // Stav pro formulář profilu
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
  const [initialForm, setInitialForm] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Stav pro Deposit Modal
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  // Stav pro Withdraw Modal
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // ---- Načtení profilu po načtení komponenty ----
  useEffect(() => {
    fetch('https://app.byxbot.com/php/profile.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 401) {
          navigate('/login');
          return null;
        }
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
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
          setInitialForm(loaded);
          setIsDirty(false);
        } else {
          setError('Chyba při načítání: ' + (data.message || ''));
        }
      })
      .catch((err) => {
        console.error('Chyba při načítání profilu:', err);
        setError('Nepodařilo se načíst profil.');
      });
  }, [navigate]);

  // ---- Úprava libovolného pole v profilu ----
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError('');
    setMessage('');
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
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

  // ---- Uložení změn profilu (POST) ----
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
      .then((res) => {
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
      .then((result) => {
        if (result === null) return;
        if (typeof result === 'object' && result.status === 'error') {
          setError(result.message);
          setMessage('');
          return;
        }
        if (typeof result === 'string') {
          const trimmed = result.trim();
          if (trimmed === '') {
            setMessage('Vše bylo úspěšně uloženo.');
            setError('');
            setInitialForm({ ...form });
            setIsDirty(false);
            return;
          }
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
            setMessage('Vše bylo úspěšně uloženo.');
            setError('');
            setInitialForm({ ...form });
            setIsDirty(false);
          }
        }
      })
      .catch((err) => {
        console.error('Chyba při ukládání profilu:', err);
        setError('Chyba při ukládání profilu.');
        setMessage('');
      });
  };

  // ---- Logout (POST) ----
  const handleLogout = () => {
    fetch('https://app.byxbot.com/php/logout.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    })
      .then((res) => {
        if (res.ok) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          navigate('/login');
        }
      })
      .catch((err) => console.error('Logout chyba:', err));
  };

  // ---- Handlery pro DepositModal ----
  const openDeposit = () => {
    setIsDepositOpen(true);
  };
  const closeDeposit = () => {
    setIsDepositOpen(false);
  };

  // ---- Handlery pro WithdrawModal ----
  const openWithdraw = () => {
    setIsWithdrawOpen(true);
  };
  const closeWithdraw = () => {
    setIsWithdrawOpen(false);
  };

  return (
    <div className="profile-container">
      <h2>Account settings</h2>

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

          {/* Deposit tlačítko */}
          <button
            type="button"
            className="btn-deposit"
            onClick={openDeposit}
          >
            Deposit
          </button>

          {/* Withdraw tlačítko */}
          <button
            type="button"
            className="btn-withdraw"
            onClick={openWithdraw}
          >
            Withdraw
          </button>

          {/* Logout tlačítko */}
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
            disabled={!isDirty}
          >
            Save
          </button>
        </div>
      </form>

      {/* Deposit modal */}
      <DepositModal isOpen={isDepositOpen} onClose={closeDeposit} />

      {/* Withdraw modal */}
      <WithdrawModal isOpen={isWithdrawOpen} onClose={closeWithdraw} />
    </div>
  );
};

export default Profile;
