import React, { useEffect, useState } from 'react';
import '../styles/initial-loader.scss';
import logo from './../assets/load.png';

export default function InitialLoader() {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const isMobilePWA = isMobile && isPWA;
  const showOnce = !isMobilePWA;
  const initialVisible = showOnce ? !window.localStorage.getItem('initialLoadDone') : isMobilePWA;
  const [visible, setVisible] = useState(initialVisible);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      if (showOnce) {
        window.localStorage.setItem('initialLoadDone', 'true');
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [visible, showOnce]);

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
