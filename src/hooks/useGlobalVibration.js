import { useEffect } from 'react';

export default function useGlobalVibration() {
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' &&
      window.matchMedia('(any-pointer: coarse)').matches;
    const canVibrate = typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function';

    if (!isMobile || !canVibrate) return;

    const handleVibrate = (e) => {
      // Používáme native event path pro větší spolehlivost
      const path = e.composedPath ? e.composedPath() : (e.path || []);
      for (let el of path) {
        if (!el || el === document || el === window) break;

        if (
          el.tagName === 'BUTTON' ||
          el.tagName === 'A' ||
          el.getAttribute?.('role') === 'button' ||
          el.matches?.('input[type="submit"], input[type="button"]')
        ) {
          navigator.vibrate(30);
          break;
        }
      }
    };

    document.body.addEventListener('click', handleVibrate, { passive: true });
    return () => {
      document.body.removeEventListener('click', handleVibrate, { passive: true });
    };
  }, []);
}
