import React, { useState, useEffect } from 'react';
import { useNotifications } from '../components/NotificationProvider';
import '../styles/_link-account-modal.scss';

const PHP_LINK_URL = "https://app.byxbot.com/php/link_account.php";

export default function LinkAccountModal({ mode, onClose }) {
  const { showNotification } = useNotifications();

  // If mode.id is set, we're already verifying an existing link
  const [platform, setPlatform] = useState(mode.platform || 'instagram');
  const [accountUrl, setAccountUrl] = useState('');
  const [step, setStep] = useState(mode.id ? 2 : 1);
  const [record, setRecord] = useState(mode.id ? mode : null);
  const [verifyCode, setVerifyCode] = useState(mode.verify_code || '');

  useEffect(() => {
    if (mode.id) {
      setStep(2);
      setRecord(mode);
      setVerifyCode(mode.verify_code || '');
    }
  }, [mode]);

  // URL validation per platform
  const validateUrlFormat = (plat, url) => {
    const trimmed = url.trim();
    let regex;
    switch (plat) {
      case 'instagram':
        regex = /^https:\/\/www\.instagram\.com\/[A-Za-z0-9._]+\/?$/;
        break;
      case 'tiktok':
        regex = /^https:\/\/www\.tiktok\.com\/@[A-Za-z0-9._]+\/?$/;
        break;
      case 'youtube':
        // shorts, @user or channel
        regex = /^https:\/\/www\.youtube\.com\/(shorts\/[\w-]+|@[\w._-]+|channel\/[\w_-]+)\/?$/;
        break;
      default:
        return false;
    }
    return regex.test(trimmed);
  };

  const handleCreate = async () => {
    if (!validateUrlFormat(platform, accountUrl)) {
      showNotification({
        type: 'error',
        message: `Invalid URL format for ${platform}.`
      });
      return onClose(false);
    }

    try {
      const res = await fetch(PHP_LINK_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          platform,
          account_url: accountUrl.trim()
        })
      });
      const json = await res.json();

      if (res.status === 409 || json.status !== 'success') {
        showNotification({ type: 'error', message: json.message });
        return onClose(false);
      }

      // Move to verification step
      setRecord(json.data);
      setVerifyCode(json.data.verify_code);
      setStep(2);
    } catch (err) {
      console.error(err);
      showNotification({ type: 'error', message: 'Network error, please try again.' });
      onClose(false);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await fetch(PHP_LINK_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          id: record.id,
          platform // so the backend verifies the correct record
        })
      });
      const json = await res.json();

      if (json.status !== 'success') {
        showNotification({ type: 'error', message: json.message });
        return;
      }

      showNotification({ type: 'success', message: 'Account successfully verified.' });
      onClose(true);
    } catch (err) {
      console.error(err);
      showNotification({ type: 'error', message: 'Error verifying account.' });
      onClose(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch(PHP_LINK_URL, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: record.id })
      });
      showNotification({ type: 'info', message: 'Account disconnected.' });
      onClose(true);
    } catch (err) {
      console.error(err);
      showNotification({ type: 'error', message: 'Error disconnecting account.' });
    }
  };

  return (
    <div className="modal-link-overlay">
      <div className="modal-link-content">
        <button
          className="modal-close-btn"
          onClick={() => {
            if (record) {
              // If a link record exists, disconnect it
              handleDisconnect();
            } else {
              // Otherwise just close the modal
              onClose(false);
            }
          }}
        >
          &times;
        </button>

        {step === 1 && (
          <>
            <h3>Link a New Account</h3>
            <label>
              Platform:
              <select value={platform} onChange={e => setPlatform(e.target.value)}>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </label>

            <label>
              Public Profile URL:
              <input
                type="text"
                value={accountUrl}
                onChange={e => setAccountUrl(e.target.value)}
                placeholder={
                  platform === 'instagram'
                    ? 'https://www.instagram.com/username/'
                    : platform === 'tiktok'
                      ? 'https://www.tiktok.com/@username'
                      : 'https://www.youtube.com/@username'
                }
              />
            </label>

            <button
              className="btn create"
              onClick={handleCreate}
              disabled={!accountUrl.trim()}
            >
              Generate Verification Code
            </button>
          </>
        )}

        {step === 2 && record && (
          <>
            <h3>Verify Linked Account</h3>
            <p>
              Please add the following code to your <strong>{platform}</strong> profile bio:
            </p>
            <div className="code-display">{verifyCode}</div>
            <button className="btn verify" onClick={handleVerify}>
              Verify
            </button>
            <button className="btn disconnect" onClick={handleDisconnect}>
              Disconnect Account
            </button>
          </>
        )}
      </div>
    </div>
  );
}
