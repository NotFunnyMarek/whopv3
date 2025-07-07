// src/App.jsx

import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import BottomBar from "./components/BottomBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Loading from "./components/Loading";

const Home                 = lazy(() => import("./pages/Home"));
const Intro                = lazy(() => import("./pages/Intro"));
const Onboarding           = lazy(() => import("./pages/Onboarding"));
const Setup                = lazy(() => import("./pages/Setup"));
const ChooseLink           = lazy(() => import("./pages/ChooseLink"));
const FeaturesSetup        = lazy(() => import("./pages/FeaturesSetup"));
const BannerSetup          = lazy(() => import("./pages/BannerSetup"));
const WhopDashboard        = lazy(() => import("./pages/WhopDashboard/WhopDashboard"));
const Dashboard            = lazy(() => import("./pages/Dashboard"));
const SubmissionsOverview  = lazy(() => import("./pages/SubmissionsOverview"));
const Login                = lazy(() => import("./pages/Login"));
const Register             = lazy(() => import("./pages/Register"));
const Profile              = lazy(() => import("./pages/Profile"));
const Balances             = lazy(() => import("./pages/Balances"));
const Memberships          = lazy(() => import("./pages/Memberships"));
const Payments             = lazy(() => import("./pages/Payments"));
const DiscordAccess        = lazy(() => import("./pages/DiscordAccess"));
const DiscordAccessSetup   = lazy(() => import("./pages/DiscordAccessSetup"));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Intro page */}
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

          {/* Setup Whop */}
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

          {/* Whop Dashboard (Member/Owner mode handled inside component) */}
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

          {/* Owner Dashboard */}
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

          {/* Submissions Overview */}
          <Route
            path="/dashboard/submissions/:campaignId"
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <Sidebar />
                  <main className="main-content">
                    <SubmissionsOverview />
                  </main>
                  <BottomBar />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Home Page */}
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

          {/* Profile */}
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

          {/* My Memberships */}
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

          {/* Payment History */}
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

          {/* Discord Access */}
          <Route
            path="/discord-access"
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <Sidebar />
                  <main className="main-content">
                    <DiscordAccess />
                  </main>
                  <BottomBar />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Discord Access Setup */}
          <Route
            path="/dashboard/discord-setup"
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <Sidebar />
                  <main className="main-content">
                    <DiscordAccessSetup />
                  </main>
                  <BottomBar />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Redirect unknown paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
