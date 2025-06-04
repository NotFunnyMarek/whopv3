import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

import './styles/App.scss';
import './styles/sidebar.scss';
import './styles/bottombar.scss';
import './styles/login.scss';
import './styles/register.scss';
import './styles/profile.scss';  // profilové styly

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
