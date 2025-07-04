import React from 'react';
import { createRoot } from 'react-dom/client';

// Global fetch wrapper to attach JWT token
const origFetch = window.fetch;
window.fetch = (url, options = {}) => {
  const opts = { ...options, credentials: 'include' };
  opts.headers = { ...(options.headers || {}) };
  const jwt = localStorage.getItem('jwtToken');
  if (jwt) {
    opts.headers['Authorization'] = `Bearer ${jwt}`;
  }
  return origFetch(url, opts);
};
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './components/NotificationProvider';

import './styles/App.scss';
import './styles/sidebar.scss';
import './styles/bottombar.scss';
import './styles/login.scss';
import './styles/register.scss';
import './styles/profile.scss';
import './styles/notifications.scss';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ThemeProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </ThemeProvider>
);
