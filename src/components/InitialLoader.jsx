import React, { useEffect, useState } from 'react';
import '../styles/initial-loader.scss';
import logo from './../assets/load.png'

export default function InitialLoader() {
  const [visible, setVisible] = useState(() => !window.localStorage.getItem('initialLoadDone'));

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      window.localStorage.setItem('initialLoadDone', 'true');
    }, 3000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;
  return (
    <div className="initial-loader">
      <img
        src={logo} // nahraď svou cestou k PNG
        alt="Loading..."
        className="initial-loader__image"
      />
    </div>
  );
}
