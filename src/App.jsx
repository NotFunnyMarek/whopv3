// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomBar from './components/BottomBar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Intro from './pages/Intro';
import Onboarding from './pages/Onboarding';
import Setup from './pages/Setup';
import ChooseLink from './pages/ChooseLink';
import FeaturesSetup from './pages/FeaturesSetup';
import BannerSetup from './pages/BannerSetup';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Import globální styly pro profil a deposit modal
import './styles/profile.scss';
import './styles/deposit-modal.scss';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Veřejné cesty */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Veřejná cesta: Intro */}
        <Route
          path="/intro"
          element={
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Intro />
              </main>
            </div>
          }
        />

        {/* Chráněná: Home */}
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

        {/* Chráněná: Onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <Onboarding />
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Chráněná: Setup pro nový dashboard */}
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <Setup />
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Chráněná: ChooseLink (druhý krok – tvorba unikátního slugu) */}
        <Route
          path="/setup/link"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <ChooseLink />
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Chráněná: FeaturesSetup – třetí krok (Features) */}
        <Route
          path="/setup/features"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <FeaturesSetup />
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Chráněná: BannerSetup – čtvrtý krok (Upload Banner) */}
        <Route
          path="/setup/banner"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <BannerSetup />
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Chráněná: Profile */}
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

        {/* Přesměrování neznámých cest */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
