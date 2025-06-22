import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/activeUsers.scss';

const ActiveUsersIndicator = ({ campaignId }) => {
  // 1) Initial random number in the range 0–50
  function getInitialUsers() {
    return Math.floor(Math.random() * 51);
  }

  // 2) New number = old ±(1–5), clamped to [0, 50]
  function getNextUsers(oldValue) {
    // step is 1–5
    const step = Math.floor(Math.random() * 5) + 1;
    const delta = Math.random() < 0.5 ? -step : step;
    let candidate = oldValue + delta;
    if (candidate < 0) candidate = 0;
    if (candidate > 50) candidate = 50;
    return candidate;
  }

  // 3) Key for localStorage
  const storageKey = 'rawActiveUsers_' + campaignId;

  // (A) State: current "raw" user count (from localStorage or random)
  const [rawUsers, setRawUsers] = useState(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored !== null && !isNaN(parseInt(stored, 10))) {
        return Number(stored);
      }
    } catch (e) {
      // ignore errors
    }
    const initRaw = getInitialUsers();
    try {
      window.localStorage.setItem(storageKey, initRaw.toString());
    } catch (e) {
      // ignore errors
    }
    return initRaw;
  });

  // (B) Animation direction: 'down' if the displayed number increases, 'up' if it decreases
  const [direction, setDirection] = useState('down');

  // Ref for timeout so we can clear it on unmount
  const updateTimeoutRef = useRef(null);

  // 4) Random interval: 50% chance short (1–5s), 50% chance long (10–20s)
  function pickNextInterval() {
    if (Math.random() < 0.5) {
      return Math.random() * (5000 - 1000) + 1000;   // 1,000–5,000 ms
    } else {
      return Math.random() * (20000 - 10000) + 10000; // 10,000–20,000 ms
    }
  }

  // Computed displayed count: about 30% less than rawUsers
  const displayedUsers = Math.floor(rawUsers * 0.7);

  useEffect(() => {
    function scheduleUpdate() {
      const interval = pickNextInterval();
      updateTimeoutRef.current = setTimeout(() => {
        const newRaw = getNextUsers(rawUsers);
        if (newRaw === rawUsers) {
          // If rawUsers didn't change, schedule again immediately
          scheduleUpdate();
          return;
        }

        // Determine animation direction based on displayed values
        const oldDisplayed = displayedUsers;
        const newDisplayed = Math.floor(newRaw * 0.7);
        setDirection(newDisplayed > oldDisplayed ? 'down' : 'up');

        // Update rawUsers state and persist
        setRawUsers(newRaw);
        try {
          window.localStorage.setItem(storageKey, newRaw.toString());
        } catch (e) {
          // ignore errors
        }

        // Schedule next update
        scheduleUpdate();
      }, interval);
    }

    scheduleUpdate();
    return () => clearTimeout(updateTimeoutRef.current);
    // Note: rawUsers (and storageKey) are intentionally in the dependency array
    // so that we always access the latest rawUsers value.
  }, [rawUsers, storageKey]);

  // Variants for Framer Motion: brief 0.3s animation with vertical shift and slight zoom
  const variants = {
    initialDown: { y: -10, opacity: 0, scale: 0.8 },
    animate:     { y:   0, opacity: 1, scale: 1   },
    exitDown:    { y:  10, opacity: 0, scale: 0.8 },
    initialUp:   { y:  10, opacity: 0, scale: 0.8 },
    exitUp:      { y: -10, opacity: 0, scale: 0.8 },
  };

  return (
    <div className="active-users-indicator">
      {/* If displayedUsers === 0 → gray dot, otherwise green pulsing dot */}
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
