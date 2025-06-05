// src/pages/Profile.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/profile.scss';

const CLOUDINARY_CLOUD_NAME    = 'dv6igcvz8';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned_profile_avatars';
const CLOUDINARY_UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    user_id:         null,
    name:            '',
    bio:             '',
    username:        '',
    email:           '',
    phone:           '',
    avatar_url:      '',
    balance:         0,
    deposit_address: '',
    showJoined:      false,
    showOwned:       false,
    showLocation:    false,
  });
  const [initialForm, setInitialForm] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // 1) Načteme profil (GET)
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
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.status === 'success') {
          const loaded = {
            user_id:         data.data.user_id ?? null,
            name:            data.data.name       || '',
            bio:             data.data.bio        || '',
            username:        data.data.username   || '',
            email:           data.data.email      || '',
            phone:           data.data.phone      || '',
            avatar_url:      data.data.avatar_url || '',
            balance:         data.data.balance    ?? 0,
            deposit_address: data.data.deposit_address || '',
            showJoined:      false,
            showOwned:       false,
            showLocation:    false,
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

  // 2) Změna polí
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
          updated.name          !== initialForm.name ||
          updated.bio           !== initialForm.bio ||
          updated.username      !== initialForm.username ||
          updated.email         !== initialForm.email ||
          updated.phone         !== initialForm.phone ||
          updated.avatar_url    !== initialForm.avatar_url;
        setIsDirty(dirtyNow);
      } else {
        setIsDirty(true);
      }
      return updated;
    });
  };

  // 3) Upload avatara
  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const saveAvatarToDb = async (avatarUrl) => {
    try {
      const payload = { avatar_url: avatarUrl };
      const res = await fetch('https://app.byxbot.com/php/profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `HTTP ${res.status}`);
      }
      setMessage('Avatar byl uložen v profilu.');
      setInitialForm((prev) => ({ ...prev, avatar_url: avatarUrl }));
      setIsDirty(false);
    } catch (err) {
      console.error('Chyba při ukládání avatar_url do DB:', err);
      setError('Nepodařilo se uložit avatar do profilu.');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Avatar je příliš velký (max. 5 MB).');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('Nepodporovaný formát (povoleno JPG, PNG, GIF).');
      return;
    }

    setError('');
    setMessage('');
    setIsUploadingAvatar(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Chyba při nahrávání na Cloudinary: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.secure_url) {
          const newUrl = data.secure_url;
          setForm((prev) => ({ ...prev, avatar_url: newUrl }));
          saveAvatarToDb(newUrl);
        } else {
          setError('Nepodařilo se získat URL z Cloudinary.');
        }
      })
      .catch((err) => {
        console.error('Chyba při uploadu na Cloudinary:', err);
        setError('Nepodařilo se nahrát avatar.');
      })
      .finally(() => {
        setIsUploadingAvatar(false);
      });
  };

  // 4) Uložení ostatních polí (name, bio, username, phone, avatar_url)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('Ukládám…');

    const payload = {
      name:       form.name,
      bio:        form.bio,
      username:   form.username,
      email:      form.email,
      phone:      form.phone,
      avatar_url: form.avatar_url,
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
        if (res.status === 400) return res.json();
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
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

  // 5) Logout
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

  // 6) Depozitní modal
  const openDepositModal = () => {
    setShowDepositModal(true);
  };
  const closeDepositModal = () => {
    setShowDepositModal(false);
  };

  // 7) Získání ceny SOL
  const [solPrice, setSolPrice] = useState(0);
  useEffect(() => {
    fetch(COINGECKO_API_URL)
      .then((res) => res.json())
      .then((data) => {
        setSolPrice(data?.solana?.usd || 0);
      })
      .catch(() => {
        setSolPrice(0);
      });
  }, []);

  return (
    <div className="profile-container">
      <h2>Account settings</h2>

      {error && <p className="profile-error">{error}</p>}
      {message && !error && <p className="profile-success">{message}</p>}

      {/* Zobrazení balance a tlačítka Deposit */}
      <div className="profile-balance-section">
        <strong>Balance:</strong> ${form.balance.toFixed(2)} USD
        <button
          type="button"
          className="btn-deposit"
          onClick={openDepositModal}
        >
          Deposit
        </button>
      </div>

      {/* Modal pro Deposit instrukce */}
      {showDepositModal && (
        <div className="deposit-modal-overlay" onClick={closeDepositModal}>
          <div
            className="deposit-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="deposit-modal-close-btn"
              onClick={closeDepositModal}
              aria-label="Close"
            >
              ✕
            </button>
            <h3>Deposit SOL (Testnet)</h3>
            <p>
              Pošlete SOL na následující adresu (Solana Testnet):<br />
              <code className="deposit-address">{form.deposit_address}</code>
            </p>
            <p>
              V peněžence (např. Phantom) zadejte částku a do „Memo“ vložte vaše <strong>user_id</strong>:{' '}
              <code>
                {form.user_id !== null ? form.user_id : '(ID není dostupné)'}
              </code>
            </p>
            <p>
              Například, pokud je vaše user_id <strong>42</strong>, v Memo napište <code>42</code>.
            </p>
            {solPrice !== 0 && (
              <p>
                1 SOL ≈ ${solPrice.toFixed(2)} USD (zdroj: CoinGecko)
              </p>
            )}
            <button
              type="button"
              className="deposit-modal-ok-btn"
              onClick={closeDepositModal}
            >
              Zavřít
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Levá část (avatar + logout) */}
        <div className="profile-left">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />

          <div
            className="profile-avatar-container"
            onClick={handleAvatarClick}
            title="Klikni pro změnu avatara"
          >
            {isUploadingAvatar && (
              <div className="avatar-uploading-overlay">Nahrávám…</div>
            )}
            {form.avatar_url ? (
              <img
                src={form.avatar_url}
                alt="avatar"
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar placeholder">
                <span>Upload</span>
              </div>
            )}
          </div>

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

        {/* Pravá část (ostatní pole) */}
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
    </div>
  );
};

export default Profile;
