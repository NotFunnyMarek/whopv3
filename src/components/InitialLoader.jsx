import React, { useEffect, useState } from 'react';
import '../styles/initial-loader.scss';
import logo from './../assets/load.png';

export default function InitialLoader() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const [visible, setVisible] = useState(() => {
    if (isStandalone) return true;
    return !window.localStorage.getItem('initialLoadDone');
  });

  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(() => {
      setVisible(false);
      if (!isStandalone) {
        window.localStorage.setItem('initialLoadDone', 'true');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [visible, isStandalone]);

  if (!visible) return null;
  return (
    <div className="initial-loader">
      <img src={logo} alt="Loading..." className="initial-loader__image" />
    </div>
  );
}
