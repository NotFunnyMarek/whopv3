import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/activeUsers.scss';

const ActiveUsersIndicator = ({ campaignId }) => {
  // 1) Náhodné počáteční číslo 3–30
  function getInitialUsers() {
    return Math.floor(Math.random() * 28) + 3;
  }

  // 2) Nové číslo = staré ±1 nebo ±2, v rámci [3, 30]
  function getNextUsers(oldValue) {
    const delta = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 2) + 1);
    let candidate = oldValue + delta;
    if (candidate < 3) candidate = 3;
    if (candidate > 30) candidate = 30;
    return candidate;
  }

  // Klíč pro localStorage
  const storageKey = 'activeUsers_' + campaignId;

  // (A) Stav: právě zobrazené číslo, načtené z localStorage nebo náhodně
  const [displayedUsers, setDisplayedUsers] = useState(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored !== null && !isNaN(parseInt(stored, 10))) {
        return Number(stored);
      }
    } catch (e) {
      // ignore
    }
    const init = getInitialUsers();
    try {
      window.localStorage.setItem(storageKey, init.toString());
    } catch (e) {
      // ignore
    }
    return init;
  });

  // (B) Směr animace: 'down' pokud číslo roste, 'up' pokud klesá
  const [direction, setDirection] = useState('down');

  // Ref pro `setTimeout`, abychom ho mohli zrušit při unmountu
  const updateTimeoutRef = useRef(null);

  // Náhodný interval 7–20 s
  function pickNextInterval() {
    return Math.random() * (20000 - 7000) + 7000;
  }

  useEffect(() => {
    // Funkce pro naplánování další změny
    function scheduleUpdate() {
      const interval = pickNextInterval();
      updateTimeoutRef.current = setTimeout(() => {
        const newCount = getNextUsers(displayedUsers);
        if (newCount === displayedUsers) {
          // žádná změna, naplánujeme hned znovu
          scheduleUpdate();
          return;
        }
        // Určíme směr animace
        setDirection(newCount > displayedUsers ? 'down' : 'up');
        // Přepíšeme displayedUsers – tím framer spustí exit/enter animaci
        setDisplayedUsers(newCount);
        try {
          window.localStorage.setItem(storageKey, newCount.toString());
        } catch (e) { /* ignore */ }
        // Hned plánujeme další update
        scheduleUpdate();
      }, interval);
    }

    scheduleUpdate();
    return () => clearTimeout(updateTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedUsers, storageKey]);

  // Framer Motion „varianty“ pro posun nahoru / dolů
  const variants = {
    initialDown: { y: -20, opacity: 0 },
    animate:     { y:   0, opacity: 1 },
    exitDown:    { y:  20, opacity: 0 },
    initialUp:   { y:  20, opacity: 0 },
    exitUp:      { y: -20, opacity: 0 },
  };

  return (
    <div className="active-users-indicator">
      <span className="dot" />

      <div className="number-wrapper">
        <AnimatePresence initial={false}>
          <motion.span
            key={displayedUsers}
            className="number"
            initial={direction === 'down' ? 'initialDown' : 'initialUp'}
            animate="animate"
            exit={direction === 'down' ? 'exitDown' : 'exitUp'}
            variants={variants}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
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
