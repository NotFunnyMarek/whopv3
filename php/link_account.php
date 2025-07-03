// src/pages/Profile.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../components/NotificationProvider';
import LinkAccountModal from '../components/LinkAccountModal';
import '../styles/profile.scss';
import '../styles/_link-account-modal.scss';

const CLOUDINARY_CLOUD_NAME    = 'dv6igcvz8';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned_profile_avatars';
const CLOUDINARY_UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { showNotification } = useNotifications();

  const [form, setForm] = useState({ /* ... */ });
  const [initialForm, setInitialForm] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(null);

  // load basic profile data
  useEffect(() => {
    // ... your existing profile fetch ...
  }, [navigate, showNotification]);

  // load linked accounts
  const loadLinked = () => {
    fetch('https://app.byxbot.com/php/link_account.php', {
      method: 'GET',
      mode: 'cors',                        // ← CHANGED: explicitly allow CORS
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    })
      .then(res => {
        if (res.status === 401) {
          navigate('/login');
          return null;
        }
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (json && json.status === 'success') {
          setLinkedAccounts(json.data);
        }
      })
      .catch(err => console.error('Link load error', err));
  };
  useEffect(loadLinked, [navigate]);

  // ... your existing form handlers ...

  // handle disconnect (DELETE)
  const handleDisconnect = (accId) => {
    fetch('https://app.byxbot.com/php/link_account.php', {
      method: 'DELETE',
      mode: 'cors',                            // ← CHANGED
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: accId })      // ← CHANGED: send JSON
    })
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success') {
          showNotification({ type: 'success', message: json.message });
          loadLinked();
        } else {
          showNotification({ type: 'error', message: json.message });
        }
      })
      .catch(err => {
        console.error('Disconnect error', err);
        showNotification({ type: 'error', message: 'Failed to disconnect.' });
      });
  };

  return (
    <div className="profile-container">
      <h2>Account Settings</h2>
      <form onSubmit={/* ... */} className="profile-form">
        {/* ... avatar & left side ... */}
        <div className="profile-right">
          {/* ... other fields ... */}

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
                      onClick={() => handleDisconnect(acc.id)}
                    >Disconnect</button>
                  : <button type="button" className="btn verify"
                      onClick={() => setShowLinkModal(acc)}
                    >Verify</button>
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
          onClose={(reload) => {
            setShowLinkModal(null);
            if (reload) loadLinked();
          }}
        />
      )}
    </div>
  );
}
