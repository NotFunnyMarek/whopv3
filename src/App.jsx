// src/App.jsx

import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import BottomBar from "./components/BottomBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Loading from "./components/Loading";

const Home           = lazy(() => import("./pages/Home"));
const Intro          = lazy(() => import("./pages/Intro"));
const Onboarding     = lazy(() => import("./pages/Onboarding"));
const Setup          = lazy(() => import("./pages/Setup"));
const ChooseLink     = lazy(() => import("./pages/ChooseLink"));
const FeaturesSetup  = lazy(() => import("./pages/FeaturesSetup"));
const BannerSetup    = lazy(() => import("./pages/BannerSetup"));
const WhopDashboard  = lazy(() => import("./pages/WhopDashboard/WhopDashboard"));
const Dashboard      = lazy(() => import("./pages/Dashboard"));        // NOVÁ STRÁNKA
const Login          = lazy(() => import("./pages/Login"));
const Register       = lazy(() => import("./pages/Register"));
const Profile        = lazy(() => import("./pages/Profile"));
const Balances       = lazy(() => import("./pages/Balances"));
const Memberships    = lazy(() => import("./pages/Memberships"));
const Payments       = lazy(() => import("./pages/Payments")); // nová stránka

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Veřejné cesty */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Intro */}
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

          {/* Onboarding */}
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

          {/* Setup Whopu */}
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

          {/* Whop Dashboard (Member/Owner režim se řeší v rámci komponenty) */}
          <Route
            path="/c/:slug"
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <Sidebar />
                  <main className="main-content">
                    <WhopDashboard />
                  </main>
                  <BottomBar />
                </div>
              </ProtectedRoute>
            }
          />

          {/* NOVÁ TRASA – OWNER DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <Sidebar />
                  <main className="main-content">
                    <Dashboard />
                  </main>
                  <BottomBar />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Domovská stránka */}
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

          {/* Profil */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <Sidebar />
                  <main className="main-content">
                    <Profile />
                  </main>
                  <BottomBar />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Balances */}
          <Route
            path="/balances"
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <Sidebar />
                  <main className="main-content">
                    <Balances />
                  </main>
                  <BottomBar />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Moje předplatná */}
          <Route
            path="/memberships"
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <Sidebar />
                  <main className="main-content">
                    <Memberships />
                  </main>
                  <BottomBar />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Historie plateb (Userské placené stránky) */}
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <Sidebar />
                  <main className="main-content">
                    <Payments />
                  </main>
                  <BottomBar />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Přesměrování neznámých cest → / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
