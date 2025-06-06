// src/pages/Profile.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/profile.scss';

// Vaše Cloudinary údaje
const CLOUDINARY_CLOUD_NAME    = 'dv6igcvz8';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned_profile_avatars';
const CLOUDINARY_UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name:        '',
    bio:         '',
    username:    '',
    email:       '',
    phone:       '',
    avatar_url:  '',
    showJoined:  false,
    showOwned:   false,
    showLocation:false,
  });
  const [initialForm, setInitialForm] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // -------------- Načtení profilu --------------
  useEffect(() => {
    fetch('https://app.byxbot.com/php/profile.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
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
            name:        data.data.name       || '',
            bio:         data.data.bio        || '',
            username:    data.data.username   || '',
            email:       data.data.email      || '',
            phone:       data.data.phone      || '',
            avatar_url:  data.data.avatar_url || '',
            showJoined:  false,
            showOwned:   false,
            showLocation:false
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

  // -------------- Změna polí v profilu --------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError('');
    setMessage('');
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      if (initialForm) {
        const dirtyNow =
          updated.name       !== initialForm.name ||
          updated.bio        !== initialForm.bio ||
          updated.username   !== initialForm.username ||
          updated.email      !== initialForm.email ||
          updated.phone      !== initialForm.phone ||
          updated.avatar_url !== initialForm.avatar_url;
        setIsDirty(dirtyNow);
      } else {
        setIsDirty(true);
      }
      return updated;
    });
  };

  // -------------- Klik na avatar – otevře file input --------------
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // -------------- Uloží avatar_url do DB --------------
  const saveAvatarToDb = async (avatarUrl) => {
    try {
      const payload = { avatar_url: avatarUrl };
      const res = await fetch('https://app.byxbot.com/php/profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      if (!res.ok) {
        // Pokud je odpověď textová nebo prázdná, pokusíme se to zpracovat
        const text = await res.text();
        let errMsg = `HTTP ${res.status}`;
        try {
          const errJson = JSON.parse(text || '{}');
          errMsg = errJson.message || errMsg;
        } catch {
          // Nepodařilo se parsovat JSON – necháme původní errMsg
        }
        throw new Error(errMsg);
      }

      // Úspěch (pravděpodobně prázdná odpověď nebo validní JSON, který nepotřebujeme číst)
      setMessage('Avatar byl uložen v profilu.');
      setInitialForm((prev) => ({
        ...prev,
        avatar_url: avatarUrl
      }));
      setIsDirty(false);
    } catch (err) {
      console.error('Chyba při ukládání avatar_url do DB:', err);
      setError('Nepodařilo se uložit avatar do profilu.');
    }
  };

  // -------------- Po výběru souboru nahrajeme na Cloudinary --------------
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validace velikosti/typu
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
      body: formData
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
          // Aktualizujeme UI
          setForm((prev) => ({
            ...prev,
            avatar_url: newUrl
          }));
          // Hned uložíme do DB
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

  // -------------- Odeslání ostatních polí profilu (jméno, bio, uživatelské jméno, telefon) --------------
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
      avatar_url: form.avatar_url  // avatar_url pošleme i zde, pro případ úplné změny i tady
    };

    fetch('https://app.byxbot.com/php/profile.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (res.status === 401) {
          navigate('/login');
          return null;
        }
        if (!res.ok) {
          return res.json().then(errJson => Promise.reject(errJson));
        }
        return res.text();
      })
      .then((result) => {
        if (result === null) return;
        // Pokud server vrací objekt { status: "error", message: "..." }
        try {
          const parsed = JSON.parse(result);
          if (parsed.status === 'error') {
            setError(parsed.message || 'Neznámá chyba při ukládání');
            setMessage('');
            return;
          }
        } catch {
          // Prázdný text nebo jiný text – předpokládáme úspěch
        }
        setMessage('Vše bylo úspěšně uloženo.');
        setError('');
        setInitialForm({ ...form });
        setIsDirty(false);
      })
      .catch((err) => {
        console.error('Chyba při ukládání profilu:', err);
        setError(err.message || 'Chyba při ukládání profilu.');
        setMessage('');
      });
  };

  // -------------- Logout --------------
  const handleLogout = () => {
    fetch('https://app.byxbot.com/php/logout.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({})
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

  return (
    <div className="profile-container">
      <h2>Account settings</h2>

      {error && <p className="profile-error">{error}</p>}
      {message && !error && <p className="profile-success">{message}</p>}

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
