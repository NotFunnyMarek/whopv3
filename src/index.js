import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import InitialLoader from './components/InitialLoader';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './components/NotificationProvider';

import './index.scss';
import './styles/App.scss';
import './styles/sidebar.scss';
import './styles/bottombar.scss';
import './styles/login-prompt-bar.scss';
import './styles/login.scss';
import './styles/register.scss';
import './styles/profile.scss';
import './styles/notifications.scss';

// Disable swipe navigation from the screen edges in mobile PWAs
window.addEventListener(
  'touchstart',
  (e) => {
    if (e.touches.length !== 1) return;
    const x = e.touches[0].clientX;
    if (x < 20 || x > window.innerWidth - 20) {
      e.preventDefault();
    }
  },
  { passive: false }
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ThemeProvider>
    <AuthProvider>
      <NotificationProvider>
        <InitialLoader />
        <App />
      </NotificationProvider>
    </AuthProvider>
  </ThemeProvider>
);
