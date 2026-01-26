import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { AppLayout } from "./components/layout/AppLayout.jsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.jsx";

import { HomePage } from "./pages/public/HomePage.jsx";
import { AboutPage } from "./pages/public/AboutPage.jsx";
import { ExplorePage } from "./pages/public/ExplorePage.jsx";
import { LoginPage } from "./pages/public/LoginPage.jsx";
import { RegisterPage } from "./pages/public/RegisterPage.jsx";

import { DashboardPage } from "./pages/app/DashboardPage.jsx";
import { ProfilePage } from "./pages/app/ProfilePage.jsx";
import { FindBuddiesPage } from "./pages/app/FindBuddiesPage.jsx";
import { BuddyDetailPage } from "./pages/app/BuddyDetailPage.jsx";
import { TripsPage } from "./pages/app/TripsPage.jsx";
import { TripDetailPage } from "./pages/app/TripDetailPage.jsx";
import { RecommendationsPage } from "./pages/app/RecommendationsPage.jsx";
import { NotificationsPage } from "./pages/app/NotificationsPage.jsx";
import { SettingsPage } from "./pages/app/SettingsPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { ChatPage } from "./pages/app/ChatPage.jsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/buddies"
              element={
                <ProtectedRoute>
                  <FindBuddiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/buddies/:id"
              element={
                <ProtectedRoute>
                  <BuddyDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/trips"
              element={
                <ProtectedRoute>
                  <TripsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/trips/:id"
              element={
                <ProtectedRoute>
                  <TripDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/recommendations"
              element={
                <ProtectedRoute>
                  <RecommendationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/app/chat/:userId" element={<ChatPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
