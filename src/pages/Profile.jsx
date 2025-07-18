// src/pages/Profile.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../components/NotificationProvider';
import LinkAccountModal from '../components/LinkAccountModal';
import '../styles/profile.scss';
import '../styles/_link-account-modal.scss';  // import styles for modal

const CLOUDINARY_CLOUD_NAME    = 'dv6igcvz8';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned_profile_avatars';
const CLOUDINARY_UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { showNotification } = useNotifications();

  // form for basic profile fields
  const [form, setForm] = useState({
    name:         '',
    bio:          '',
    username:     '',
    email:        '',
    phone:        '',
    avatar_url:   '',
    showJoined:   false,
    showOwned:    false,
    showLocation: false,
  });
  const [initialForm, setInitialForm] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // for linked accounts
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(null);  // null | {action:'create'} | account record

  // load basic profile data
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
            name:         data.data.name        || '',
            bio:          data.data.bio         || '',
            username:     data.data.username    || '',
            email:        data.data.email       || '',
            phone:        data.data.phone       || '',
            avatar_url:   data.data.avatar_url  || '',
            showJoined:   false,
            showOwned:    false,
            showLocation: false,
          };
          setForm(loaded);
          setInitialForm(loaded);
          setIsDirty(false);
        } else {
          showNotification({ type: 'error', message: 'Error loading profile: ' + (data.message || '') });
        }
      })
      .catch((err) => {
        console.error('Error loading profile:', err);
        showNotification({ type: 'error', message: 'Failed to load profile.' });
      });
  }, [navigate, showNotification]);

  // load linked accounts
  const loadLinked = () => {
    fetch('https://app.byxbot.com/php/link_account.php', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success') setLinkedAccounts(json.data);
      })
      .catch(err => console.error('Link load error', err));
  };
  useEffect(loadLinked, []);

  // handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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

  const handleAvatarClick = () => fileInputRef.current?.click();

  // save avatar URL to database
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
        const text = await res.text();
        let errMsg = `HTTP ${res.status}`;
        try {
          const errJson = JSON.parse(text || '{}');
          errMsg = errJson.message || errMsg;
        } catch {}
        throw new Error(errMsg);
      }
      showNotification({ type: 'success', message: 'Avatar saved to profile.' });
      setInitialForm(prev => ({ ...prev, avatar_url: avatarUrl }));
      setIsDirty(false);
    } catch (err) {
      console.error('Error saving avatar_url to DB:', err);
      showNotification({ type: 'error', message: 'Failed to save avatar.' });
    }
  };

  // handle avatar file selection and upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showNotification({ type: 'error', message: 'Avatar is too large (max 5 MB).' });
      return;
    }
    if (!['image/jpeg','image/png','image/gif'].includes(file.type)) {
      showNotification({ type: 'error', message: 'Unsupported format (JPG, PNG, GIF).' });
      return;
    }
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: formData })
      .then(res => {
        if (!res.ok) throw new Error(`Cloudinary ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.secure_url) {
          setForm(prev => ({ ...prev, avatar_url: data.secure_url }));
          saveAvatarToDb(data.secure_url);
        } else {
          showNotification({ type: 'error', message: 'Failed to obtain URL from Cloudinary.' });
        }
      })
      .catch(err => {
        console.error(err);
        showNotification({ type: 'error', message: 'Failed to upload avatar.' });
      })
      .finally(() => setIsUploadingAvatar(false));
  };

  // handle profile form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    showNotification({ type: 'info', message: 'Saving…' });
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
      headers: { 'Content-Type':'application/json' },
      credentials:'include',
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (res.status === 401) {
          navigate('/login'); return null;
        }
        if (!res.ok) return res.json().then(errJson => Promise.reject(errJson));
        return res.text();
      })
      .then(result => {
        if (result === null) return;
        try {
          const p = JSON.parse(result);
          if (p.status === 'error') {
            showNotification({ type:'error', message: p.message }); return;
          }
        } catch {}
        showNotification({ type:'success', message:'Profile saved successfully.' });
        setInitialForm({ ...form });
        setIsDirty(false);
      })
      .catch(err => {
        console.error(err);
        showNotification({ type:'error', message: err.message||'Error saving profile.' });
      });
  };

  // handle logout action
  const handleLogout = () => {
    fetch('https://app.byxbot.com/php/logout.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      credentials:'include',
      body: JSON.stringify({})
    })
      .then(res => {
        if (res.ok) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          showNotification({ type:'info', message:'You have been logged out.' });
          navigate('/login');
        }
      })
      .catch(err => {
        console.error(err);
        showNotification({ type:'error', message:'Error during logout.' });
      });
  };

  // close linked account modal
  const onLinkModalClose = (reload=false) => {
    setShowLinkModal(null);
    if (reload) loadLinked();
  };

  return (
    <div className="profile-container">
      <h2>Account Settings</h2>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* left side: avatar, logout */}
        <div className="profile-left">
          <input type="file" accept="image/*" ref={fileInputRef} style={{display:'none'}} onChange={handleAvatarChange} />
          <div className="profile-avatar-container" onClick={handleAvatarClick} title="Click to change avatar">
            {isUploadingAvatar && <div className="avatar-uploading-overlay">Uploading…</div>}
            {form.avatar_url
              ? <img src={form.avatar_url} alt="avatar" className="profile-avatar" />
              : <div className="profile-avatar placeholder"><span>Upload</span></div>
            }
          </div>
          <h3>{form.name || 'User'}</h3>
          <p className="profile-sub">@{form.username || ''}</p>
          <button type="button" className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>

        {/* right side: fields and linked accounts */}
        <div className="profile-right">
          <label>
            Name
            <input type="text" name="name" value={form.name} onChange={handleChange} />
          </label>
          <label>
            Bio
            <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="No bio" />
          </label>
          <label>
            Username
            <input type="text" name="username" value={form.username} onChange={handleChange} />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} disabled />
          </label>
          <label>
            Phone Number
            <div className="phone-input">
              <span>🇨🇿</span>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="+420____" />
            </div>
          </label>

          <p className="section-title">What can people see in your profile?</p>
          <label className="checkbox-label">
            Joined Whops
            <input type="checkbox" name="showJoined" checked={form.showJoined} onChange={handleChange} />
          </label>
          <label className="checkbox-label">
            Owned Whops
            <input type="checkbox" name="showOwned" checked={form.showOwned} onChange={handleChange} />
          </label>
          <label className="checkbox-label">
            Approximate Location
            <input type="checkbox" name="showLocation" checked={form.showLocation} onChange={handleChange} />
          </label>

          {/* linked accounts */}
          <p className="section-title">Linked Accounts</p>
          <ul className="linked-list">
            {linkedAccounts.map(acc => (
              <li key={acc.id}>
                <strong>{acc.platform}</strong>:{" "}
                <a href={acc.account_url} target="_blank" rel="noopener noreferrer">
                  {acc.account_url}
                </a>{" "}
                {acc.is_verified
                  ? <button type="button" className="btn disconnect"
                      onClick={() => {
                        fetch('https://app.byxbot.com/php/link_account.php', {
                          method: 'DELETE',
                          credentials: 'include',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: acc.id })
                        }).then(() => onLinkModalClose(true));
                      }}
                    >Disconnect</button>
                  : <button type="button" className="btn verify" onClick={() => setShowLinkModal(acc)}>
                      Verify
                    </button>
                }
              </li>
            ))}
          </ul>
          <button type="button" className="btn create" onClick={() => setShowLinkModal({ action: 'create' })}>
            Link New Account
          </button>

          <button type="submit" className="btn-save" disabled={!isDirty}>
            Save
          </button>
        </div>
      </form>

      {showLinkModal && (
        <LinkAccountModal
          mode={showLinkModal}
          onClose={onLinkModalClose}
        />
      )}
    </div>
  );
}
