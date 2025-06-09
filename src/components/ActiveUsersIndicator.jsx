import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/activeUsers.scss';

const ActiveUsersIndicator = ({ campaignId }) => {
  // 1) Počáteční náhodné číslo v rozsahu 0–50
  function getInitialUsers() {
    return Math.floor(Math.random() * 51);
  }

  // 2) Nové číslo = staré ±(1–5), v rozsahu [0, 50]
  function getNextUsers(oldValue) {
    // delta je ±(1–5)
    const step = Math.floor(Math.random() * 5) + 1; // 1–5
    const delta = Math.random() < 0.5 ? -step : step;
    let candidate = oldValue + delta;
    if (candidate < 0) candidate = 0;
    if (candidate > 50) candidate = 50;
    return candidate;
  }

  // 3) Klíč do localStorage
  const storageKey = 'rawActiveUsers_' + campaignId;

  // (A) Stav: aktuální "raw" počet uživatelů (z localStorage nebo náhodné)
  const [rawUsers, setRawUsers] = useState(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored !== null && !isNaN(parseInt(stored, 10))) {
        return Number(stored);
      }
    } catch (e) {
      // ignore
    }
    const initRaw = getInitialUsers();
    try {
      window.localStorage.setItem(storageKey, initRaw.toString());
    } catch (e) {
      // ignore
    }
    return initRaw;
  });

  // (B) Směr animace: 'down' pokud číslo roste, 'up' pokud klesá
  const [direction, setDirection] = useState('down');

  // Ref pro timeout, abychom ho mohli zrušit při unmountu
  const updateTimeoutRef = useRef(null);

  // 4) Náhodný interval: 50 % krátký (1–5 s), 50 % dlouhý (10–20 s)
  function pickNextInterval() {
    if (Math.random() < 0.5) {
      return Math.random() * (5000 - 1000) + 1000;   // 1 000–5 000 ms
    } else {
      return Math.random() * (20000 - 10000) + 10000; // 10 000–20 000 ms
    }
  }

  // Vypočítaný zobrazený počet: cca 30 % méně než rawUsers
  const displayedUsers = Math.floor(rawUsers * 0.7);

  useEffect(() => {
    function scheduleUpdate() {
      const interval = pickNextInterval();
      updateTimeoutRef.current = setTimeout(() => {
        const newRaw = getNextUsers(rawUsers);
        if (newRaw === rawUsers) {
          // Pokud se rawUsers nezmění, naplánujeme hned znovu
          scheduleUpdate();
          return;
        }

        // Určeme směr animace na základě zobrazených hodnot
        const oldDisplayed = displayedUsers;
        const newDisplayed = Math.floor(newRaw * 0.7);
        setDirection(newDisplayed > oldDisplayed ? 'down' : 'up');

        // Nastavíme nový raw stav
        setRawUsers(newRaw);
        try {
          window.localStorage.setItem(storageKey, newRaw.toString());
        } catch (e) {
          // ignore
        }

        // Hned plánujeme další update
        scheduleUpdate();
      }, interval);
    }

    scheduleUpdate();
    return () => clearTimeout(updateTimeoutRef.current);
    // Poznámka: závislost rawUsers (a storageKey) je záměrná,
    // abychom vždy přistupovali k nejaktuálnějšímu rawUsers.
  }, [rawUsers, storageKey]);

  // Variants pro Framer Motion: krátká animace 0.3 s s vertikálním posunem a mírným zoomem
  const variants = {
    initialDown: { y: -10, opacity: 0, scale: 0.8 },
    animate:     { y:   0, opacity: 1, scale: 1   },
    exitDown:    { y:  10, opacity: 0, scale: 0.8 },
    initialUp:   { y:  10, opacity: 0, scale: 0.8 },
    exitUp:      { y: -10, opacity: 0, scale: 0.8 },
  };

  return (
    <div className="active-users-indicator">
      {/* Pokud displayedUsers === 0 → šedá tečka, jinak zelená pulsující */}
      <span className={`dot ${displayedUsers === 0 ? 'zero' : 'active'}`} />

      <div className="number-wrapper">
        <AnimatePresence initial={false} exitBeforeEnter>
          <motion.span
            key={displayedUsers}
            className="number"
            initial={direction === 'down' ? 'initialDown' : 'initialUp'}
            animate="animate"
            exit={direction === 'down' ? 'exitDown' : 'exitUp'}
            variants={variants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {displayedUsers}
          </motion.span>
        </AnimatePresence>
      </div>

      <span className="suffix">online</span>
    </div>
  );
};

export default ActiveUsersIndicator;
