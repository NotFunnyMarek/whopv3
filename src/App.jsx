// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomBar from './components/BottomBar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';  // ← nově importujeme Profile

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Veřejné cesty */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
