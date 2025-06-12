import React, { useState, useEffect } from 'react';
import { useNotifications } from '../components/NotificationProvider';
import '../styles/_link-account-modal.scss';

const PHP_LINK_URL = "https://app.byxbot.com/php/link_account.php";

export default function LinkAccountModal({ mode, onClose }) {
  const { showNotification } = useNotifications();

  // If mode.id is set, we're already verifying an existing link
  const [platform, setPlatform] = useState(mode.platform || 'instagram');
  const [url, setUrl] = useState('');
  const [step, setStep] = useState(mode.id ? 2 : 1);
  const [record, setRecord] = useState(mode.id ? mode : null);
  const [code, setCode] = useState(mode.verify_code || '');

  useEffect(() => {
    if (mode.id) {
      setStep(2);
      setRecord(mode);
      setCode(mode.verify_code || '');
    }
  }, [mode]);

  // URL validation per platform
  const validateUrlFormat = (plat, u) => {
    const t = u.trim();
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
    return regex.test(t);
  };

  const handleCreate = async () => {
    if (!validateUrlFormat(platform, url)) {
      showNotification({
        type: 'error',
        message: `Neplatný formát URL pro ${platform}`
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
          account_url: url.trim()
        })
      });
      const json = await res.json();

      if (res.status === 409 || json.status !== 'success') {
        showNotification({ type: 'error', message: json.message });
        return onClose(false);
      }

      // Move to verification step
      setRecord(json.data);
      setCode(json.data.verify_code);
      setStep(2);
    } catch (err) {
      console.error(err);
      showNotification({ type: 'error', message: 'Síťová chyba, zkuste to znovu.' });
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
          platform // pass platform so PHP verifies correct row
        })
      });
      const json = await res.json();

      if (json.status !== 'success') {
        showNotification({ type: 'error', message: json.message });
        return;
      }

      showNotification({ type: 'success', message: 'Účet byl úspěšně ověřen.' });
      onClose(true);
    } catch (err) {
      console.error(err);
      showNotification({ type: 'error', message: 'Chyba při ověřování účtu.' });
      onClose(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch(PHP_LINK_URL, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${record.id}`
      });
      showNotification({ type: 'info', message: 'Účet byl odpojen.' });
      onClose(true);
    } catch (err) {
      console.error(err);
      showNotification({ type: 'error', message: 'Chyba při odpojování účtu.' });
    }
  };

  return (
    <div className="modal-link-overlay">
      <div className="modal-link-content">
        <button
  className="modal-close-btn"
  onClick={() => {
    if (record) {
      // If we've already created a link record, disconnect it
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
            <h3>Propojit nový účet</h3>
            <label>
              Platforma:
              <select value={platform} onChange={e => setPlatform(e.target.value)}>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
            </label>

            <label>
              Veřejná URL:
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={
                  platform === 'instagram'
                    ? 'https://www.instagram.com/username/'
                    : platform === 'tiktok'
                      ? 'https://www.tiktok.com/@username'
                      : 'https://www.youtube.com/@username'
                }
              />
            </label>

            <button className="btn create" onClick={handleCreate} disabled={!url.trim()}>
              Vygenerovat ověřovací kód
            </button>
          </>
        )}

        {step === 2 && record && (
          <>
            <h3>Ověření účtu</h3>
            <p>
              Do bio na <strong>{platform}</strong> vložte níže uvedený kód:
            </p>
            <div className="code-display">{code}</div>
            <button className="btn verify" onClick={handleVerify}>
              Ověřit
            </button>
            <button className="btn disconnect" onClick={handleDisconnect}>
              Odpojit účet
            </button>
          </>
        )}
      </div>
    </div>
  );
}
