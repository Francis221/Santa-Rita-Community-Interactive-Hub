import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  HelpCircle,
  ShieldCheck,
  UserPlus,
  LogOut,
  Menu,
  X,
  Home,
  MessageSquare,
  FileText,
  BarChart3,
  Calendar,
  Megaphone,
  Users,
  Settings,
  FolderKanban,
  User
} from "lucide-react";
import { navLinks, sidebarLinks, barangay } from "../constants/hubConfig";
import { useAuth } from "../context/AuthContext";
import { DB } from "../services/db";
import communityLogo from "../logo/community-c-logo-transparent.png";
import "./Navbar.css";

/**
 * Navbar Component
 * Desktop & Mobile navigation header with quick actions, search, notifications,
 * user badge, and fully-featured responsive mobile navigation drawer.
 */
export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const refreshCount = () => {
    setPendingRequestsCount(DB.getPendingFriendRequestsCount());
  };

  useEffect(() => {
    refreshCount();
    window.addEventListener("friendsUpdated", refreshCount);

    // Allow MobileBottomNav or other components to toggle the mobile menu
    const handleToggle = () => setIsMobileMenuOpen((prev) => !prev);
    const handleClose = () => setIsMobileMenuOpen(false);
    window.addEventListener("toggleMobileMenu", handleToggle);
    window.addEventListener("closeMobileMenu", handleClose);

    return () => {
      window.removeEventListener("friendsUpdated", refreshCount);
      window.removeEventListener("toggleMobileMenu", handleToggle);
      window.removeEventListener("closeMobileMenu", handleClose);
    };
  }, []);

  // Close mobile menu whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const displayName = user?.username || "User";
  const userRole = user?.role || "Resident";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      {/* Top Navbar Header */}
      <header className="navbar">
        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          type="button"
          className="navbar__mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile navigation menu"
          title="Open Navigation Menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Brand logo & community title (Clicking navigates to Home) */}
        <div className="navbar__brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span className="navbar__mark">
            <img src={communityLogo} alt="Barangay Logo" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
          </span>
          <span className="navbar__name">Community Hub</span>
        </div>

        {/* Desktop Primary Navigation Links */}
        <nav className="navbar__links" aria-label="Primary Desktop Navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.id}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                "navbar__link" + (isActive ? " navbar__link--active" : "")
              }
              title={`Go to ${link.label}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop & Mobile Actions Container */}
        <div className="navbar__actions">
          {/* Search bar input for finding residents */}
          <div className="navbar__search">
            <Search size={16} strokeWidth={2} />
            <input
              type="search"
              placeholder="Search residents..."
              aria-label="Search residents in hub"
              onClick={() => navigate("/find-friends")}
            />
          </div>

          {/* Button to view pending Friend Requests */}
          <button
            className="navbar__icon-btn"
            type="button"
            aria-label="Friend Requests"
            onClick={() => navigate("/find-friends")}
            title="Friend Requests"
            style={{ position: "relative" }}
          >
            <UserPlus size={18} strokeWidth={1.8} />
            {pendingRequestsCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: "bold",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {pendingRequestsCount}
              </span>
            )}
          </button>

          {/* Button to open Help Center & hotlines */}
          <button
            className="navbar__icon-btn"
            type="button"
            aria-label="Help Center"
            title="Emergency hotlines & help"
            onClick={() => {
              const el = document.getElementById("hotlines-section");
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else navigate("/");
            }}
          >
            <HelpCircle size={18} strokeWidth={1.8} />
          </button>

          {/* Button to view Announcements / Notifications */}
          <button
            className="navbar__icon-btn"
            type="button"
            aria-label="Notifications"
            title="Latest announcements & alerts"
            onClick={() => navigate("/announcements")}
          >
            <Bell size={18} strokeWidth={1.8} />
            <span className="navbar__dot" />
          </button>

          {/* User profile card (Clicking opens user profile page) */}
          <div className="navbar__user" title="View Profile" onClick={() => navigate("/profile")}>
            {user?.avatar ? (
              <img src={user.avatar} alt={displayName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <span className="navbar__avatar">{initials}</span>
            )}
            <div className="navbar__user-copy">
              <span className="navbar__user-name">{displayName}</span>
              <span className="navbar__user-role">
                <ShieldCheck size={12} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle', color: userRole === 'Admin' ? '#10b981' : '#3b82f6' }} />
                {userRole}
              </span>
            </div>
          </div>

          {/* Button to initiate logout modal */}
          <button
            className="navbar__icon-btn navbar__icon-btn--logout"
            type="button"
            aria-label="Log Out"
            title="Sign out of Community Hub"
            onClick={() => window.dispatchEvent(new Event("openLogoutModal"))}
            style={{ marginLeft: 6, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.08)' }}
          >
            <LogOut size={16} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* Responsive Mobile Navigation Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close mobile navigation overlay"
        />
      )}

      {/* Slide-out Mobile Navigation Drawer Panel */}
      <aside className={`mobile-nav-drawer ${isMobileMenuOpen ? "mobile-nav-drawer--open" : ""}`}>
        {/* Mobile Drawer Header */}
        <div className="mobile-nav-drawer__header">
          <div className="mobile-nav-drawer__brand" onClick={() => navigate("/")}>
            <img src={communityLogo} alt="Barangay Logo" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#f8fafc' }}>Sta. Rita Hub</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Agoo, La Union</div>
            </div>
          </div>
          {/* Button to close mobile drawer */}
          <button
            type="button"
            className="mobile-nav-drawer__close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu drawer"
            title="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card in Mobile Drawer */}
        <div className="mobile-nav-drawer__user" onClick={() => navigate("/profile")}>
          {user?.avatar ? (
            <img src={user.avatar} alt={displayName} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className="navbar__avatar" style={{ width: 42, height: 42, fontSize: '15px' }}>{initials}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '12px', color: userRole === 'Admin' ? '#34d399' : '#60a5fa', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={13} /> {userRole}
            </div>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mobile-nav-drawer__search" onClick={() => { setIsMobileMenuOpen(false); navigate("/find-friends"); }}>
          <Search size={16} color="#94a3b8" />
          <span>Search residents & neighbors...</span>
        </div>

        {/* Navigation Sections */}
        <div className="mobile-nav-drawer__nav-content">
          <div className="mobile-nav-section-title">MAIN NAVIGATION</div>
          <div className="mobile-nav-links-grid">
            {/* Nav Link: Home */}
            <NavLink to="/" end className={({ isActive }) => "mobile-drawer-link" + (isActive ? " mobile-drawer-link--active" : "")}>
              <Home size={18} />
              <span>Home</span>
            </NavLink>
            {/* Nav Link: Chats */}
            <NavLink to="/chats" className={({ isActive }) => "mobile-drawer-link" + (isActive ? " mobile-drawer-link--active" : "")}>
              <MessageSquare size={18} />
              <span>Chats</span>
            </NavLink>
            {/* Nav Link: Announcements */}
            <NavLink to="/announcements" className={({ isActive }) => "mobile-drawer-link" + (isActive ? " mobile-drawer-link--active" : "")}>
              <Megaphone size={18} />
              <span>Announcements</span>
            </NavLink>
            {/* Nav Link: Events */}
            <NavLink to="/events" className={({ isActive }) => "mobile-drawer-link" + (isActive ? " mobile-drawer-link--active" : "")}>
              <Calendar size={18} />
              <span>Events</span>
            </NavLink>
            {/* Nav Link: Officials */}
            <NavLink to="/officials" className={({ isActive }) => "mobile-drawer-link" + (isActive ? " mobile-drawer-link--active" : "")}>
              <Users size={18} />
              <span>Officials</span>
            </NavLink>
            {/* Nav Link: Find Friends */}
            <NavLink to="/find-friends" className={({ isActive }) => "mobile-drawer-link" + (isActive ? " mobile-drawer-link--active" : "")}>
              <UserPlus size={18} />
              <span>Find Friends</span>
            </NavLink>
          </div>

          <div className="mobile-nav-section-title" style={{ marginTop: '16px' }}>SERVICES & CASES</div>
          <div className="mobile-nav-links-grid">
            {/* Nav Link: Request Document */}
            <NavLink to="/request-document" className={({ isActive }) => "mobile-drawer-link" + (isActive ? " mobile-drawer-link--active" : "")}>
              <FileText size={18} />
              <span>Request Docs</span>
            </NavLink>
            {/* Nav Link: Reports */}
            <NavLink to="/reports" className={({ isActive }) => "mobile-drawer-link" + (isActive ? " mobile-drawer-link--active" : "")}>
              <BarChart3 size={18} />
              <span>Reports</span>
            </NavLink>
            {/* Nav Link: Projects */}
            <NavLink to="/projects" className={({ isActive }) => "mobile-drawer-link" + (isActive ? " mobile-drawer-link--active" : "")}>
              <FolderKanban size={18} />
              <span>Projects</span>
            </NavLink>
            {/* Nav Link: User Profile */}
            <NavLink to="/profile" className={({ isActive }) => "mobile-drawer-link" + (isActive ? " mobile-drawer-link--active" : "")}>
              <User size={18} />
              <span>Profile</span>
            </NavLink>
            {/* Nav Link: Settings */}
            <NavLink to="/settings" className={({ isActive }) => "mobile-drawer-link" + (isActive ? " mobile-drawer-link--active" : "")}>
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>

        {/* Logout Action in Mobile Drawer */}
        <div className="mobile-nav-drawer__footer">
          {/* Button to confirm logout on mobile */}
          <button
            type="button"
            className="mobile-drawer-logout-btn"
            onClick={() => {
              setIsMobileMenuOpen(false);
              window.dispatchEvent(new Event("openLogoutModal"));
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
