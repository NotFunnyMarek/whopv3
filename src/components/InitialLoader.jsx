import React, { useEffect, useState } from 'react';
import '../styles/initial-loader.scss';

export default function InitialLoader() {
  const [visible, setVisible] = useState(() => !window.localStorage.getItem('initialLoadDone'));

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      window.localStorage.setItem('initialLoadDone', 'true');
    }, 1500);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;
  return (
    <div className="initial-loader">
      <div className="initial-loader__spinner" />
    </div>
  );
}
