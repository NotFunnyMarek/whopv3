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
import WhopDashboard from './pages/WhopDashboard';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Balances from './pages/Balances';

// Globální styly
import './styles/sidebar.scss';
import './styles/balances.scss';
import './styles/deposit-modal.scss';
import './styles/withdraw-modal.scss';
import './styles/profile.scss';
import './styles/intro.scss';
import './styles/onboarding.scss';
import './styles/setup.scss';
import './styles/choose-link.scss';
import './styles/features-setup.scss';
import './styles/banner-setup.scss';
import './styles/whop-dashboard.scss'; // ujistěte se, že máte i tento import

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

        {/* Chráněné: Onboarding */}
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

        {/* Chráněné: Setup (krok 1) */}
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

        {/* Chráněné: ChooseLink (krok 2) */}
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

        {/* Chráněné: FeaturesSetup (krok 3) */}
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

        {/* Chráněné: BannerSetup (krok 4) */}
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

        {/* NOVÉ: WhopDashboard – nyní pod /c/:slug */}
        <Route
          path="/c/:slug"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <WhopDashboard />
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Chráněné: Home */}
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

        {/* Chráněné: Profile */}
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

        {/* Chráněné: Balances */}
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

        {/* Přesměrování neznámých cest → / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
