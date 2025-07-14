import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
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

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ThemeProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </ThemeProvider>
);
