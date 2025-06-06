// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomBar from './components/BottomBar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Balances from './pages/Balances'; // ← import nové stránky

// Globální styly
import './styles/sidebar.scss';
import './styles/balances.scss';
import './styles/deposit-modal.scss';
import './styles/withdraw-modal.scss';
import './styles/profile.scss';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Veřejné cesty */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Chráněná cesta: Home */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <Home />
                </main>
                <BottomBar />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Chráněná cesta: Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <Profile />
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Chráněná cesta: Balances */}
        <Route
          path="/balances"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <Balances />
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Neznámé cesty → přesměrování na / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
