import { useEffect } from 'react';

export default function useGlobalVibration() {
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' &&
      window.matchMedia('(any-pointer: coarse)').matches;
    const canVibrate = typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function';

    if (!isMobile || !canVibrate) {
      return;
    }

    const handleVibrate = e => {
      const target = e.target.closest(
        'button, a, [role="button"], input[type="button"], input[type="submit"]'
      );
      if (target) {
        navigator.vibrate(30);
      }
    };

    document.body.addEventListener('click', handleVibrate, true);
    return () => {
      document.body.removeEventListener('click', handleVibrate, true);
    };
  }, []);
}
