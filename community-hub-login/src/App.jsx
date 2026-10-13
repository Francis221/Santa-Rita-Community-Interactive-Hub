import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";

// Layout
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";

// Pages & Feature Modules
import Home from "./pages/Home";
import Officials from "./pages/Officials";
import Reports from "./pages/Reports";
import MyReports from "./pages/MyReports";
import RequestDocument from "./pages/RequestDocument";
import Profile from "./pages/Profile";
import Placeholder from "./pages/Placeholder";
import FindFriendsPage from "./components/friends/FindFriendsPage";
import AnnouncementsPage from "./components/announcements/AnnouncementsPage";
import EventsPage from "./components/events/EventsPage";
import Chats from "./components/chats/Chats";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";

import "./styles/home.css";

const PLACEHOLDER_ROUTES = [
  { path: "/projects", title: "Projects" },
  { path: "/settings", title: "Settings" },
];

function ProtectedReportRoute() {
  const { user } = useAuth();

  if (user?.role !== "Admin") {
    return (
      <div className="page" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
          Access Restricted
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
          Full council case management is reserved exclusively for Barangay Administrators.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            to="/my-reports"
            style={{
              display: 'inline-block',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              padding: '0.6rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            View My Reports
          </Link>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              backgroundColor: '#334155',
              color: '#ffffff',
              padding: '0.6rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return <Reports />;
}

export default function App() {
  // Handler to toggle mobile navigation drawer from bottom navigation bar
  const handleToggleMobileMenu = () => {
    window.dispatchEvent(new Event("toggleMobileMenu"));
  };

  return (
    /* Main application shell layout */
    <div className="app-shell">
      {/* Desktop sidebar navigation (hidden on mobile <= 900px) */}
      <Sidebar />

      {/* Main viewport shell containing header, pages, and footer */}
      <div className="app-shell__main">
        {/* Top Navigation bar with responsive mobile menu toggle */}
        <Navbar />

        {/* Dynamic page routes content area */}
        <main className="app-shell__content" id="top">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/find-friends" element={<FindFriendsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/officials" element={<Officials />} />
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/reports" element={<ProtectedReportRoute />} />
            <Route path="/request-document" element={<RequestDocument />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chats" element={<Chats />} />
            {PLACEHOLDER_ROUTES.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<Placeholder title={route.title} />}
              />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Global application footer */}
        <Footer />

        {/* Mobile bottom navigation bar for quick 1-tap navigation on phones & tablets */}
        <MobileBottomNav onToggleMenu={handleToggleMobileMenu} />
      </div>
    </div>
  );
}
