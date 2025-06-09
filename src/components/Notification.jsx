// src/components/Notification.jsx

import React, { useEffect, useState } from 'react';

export default function Notification({ type, message }) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHide(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`notification ${type} ${hide ? 'hide' : ''}`}>
      <span className="notification-message">{message}</span>
    </div>
  );
}
