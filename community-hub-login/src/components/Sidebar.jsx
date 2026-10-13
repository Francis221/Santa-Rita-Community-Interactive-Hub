import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  User,
  Megaphone,
  Calendar,
  UserPlus,
  BarChart3,
  FileText,
  Users,
  MessageSquare,
  FolderKanban,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { barangay } from "../constants/hubConfig";
import { useAuth } from "../context/AuthContext";
import LogoutModal from "./LogoutModal";
import "./Sidebar.css";

const ICONS = {
  Home,
  User,
  Megaphone,
  Calendar,
  UserPlus,
  BarChart3,
  FileText,
  Users,
  MessageSquare,
  FolderKanban,
  Settings,
};

// Comprehensive sidebar links including Home and all community services
const BASE_SIDEBAR_ITEMS = [
  { id: "profile", label: "Profile", icon: "User", to: "/profile" },

  { id: "request", label: "Request Document", icon: "FileText", to: "/request-document" },
  { id: "my-reports", label: "My Reports", icon: "BarChart3", to: "/my-reports", residentOnly: true },
  { id: "reports", label: "Reports", icon: "BarChart3", to: "/reports", adminOnly: true },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Desktop collapsed state initialized from localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Mobile off-canvas drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Toggle collapse state on desktop and persist in localStorage
  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebar_collapsed", String(next));
      } catch { }
      return next;
    });
  };

  // Listen for mobile menu toggle and logout modal events
  useEffect(() => {
    const handleToggleMobile = () => setIsMobileOpen((prev) => !prev);
    const handleCloseMobile = () => setIsMobileOpen(false);
    const handleOpenLogout = () => setIsLogoutModalOpen(true);

    window.addEventListener("toggleMobileMenu", handleToggleMobile);
    window.addEventListener("closeMobileMenu", handleCloseMobile);
    window.addEventListener("openLogoutModal", handleOpenLogout);

    return () => {
      window.removeEventListener("toggleMobileMenu", handleToggleMobile);
      window.removeEventListener("closeMobileMenu", handleCloseMobile);
      window.removeEventListener("openLogoutModal", handleOpenLogout);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleConfirmLogout = async () => {
    await logout();
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar__overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close navigation drawer"
        />
      )}

      {/* Main Sidebar (Desktop Collapsible & Mobile Drawer) */}
      <aside
        className={`sidebar ${isCollapsed ? "sidebar--collapsed" : ""} ${isMobileOpen ? "sidebar--mobile-open" : ""
          }`}
        aria-label="Community Hub Navigation"
      >
        {/* Mobile-only Close Button */}
        <div className="sidebar__mobile-header">
          <span className="sidebar__mobile-brand-title">Menu Navigation</span>
          <button
            type="button"
            className="sidebar__mobile-close-btn"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close sidebar drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Branding Area with Collapse Toggle Button */}
        <div className="sidebar__brand-container">
          <div
            className="sidebar__brand"
            onClick={() => navigate("/")}
            title="Go to Home"
            role="button"
            tabIndex={0}
          >
            <div className="sidebar__logo">
              <img
                src={barangay.photo || "/photo/logostarita.jpg"}
                alt="Barangay Sta. Rita Logo"
                className="sidebar__logo-img"
              />
            </div>
            {!isCollapsed && (
              <div className="sidebar__brand-text">
                <p className="sidebar__title">
                  {barangay.name.split(" ")[0].toUpperCase()}
                  <span> {barangay.name.split(" ").slice(1).join(" ").toUpperCase()}</span>
                </p>
                <p className="sidebar__subtitle">{barangay.municipality.toUpperCase()}</p>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            type="button"
            className="sidebar__toggle-btn"
            onClick={handleToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Primary Sidebar Navigation Menu */}
        <nav className="sidebar__nav" aria-label="Sidebar Main Navigation">
          <ul>
            {BASE_SIDEBAR_ITEMS.filter((link) => {
              if (link.adminOnly && user?.role !== "Admin") return false;
              if (link.residentOnly && user?.role === "Admin") return false;
              return true;
            }).map((link) => {
              const Icon = ICONS[link.icon] || Home;
              return (
                <li key={link.id}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      "sidebar__link" + (isActive ? " sidebar__link--active" : "")
                    }
                    data-tooltip={link.label}
                    title={isCollapsed ? link.label : undefined}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon size={19} strokeWidth={1.9} className="sidebar__link-icon" />
                    {!isCollapsed && (
                      <span className="sidebar__link-label">{link.label}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Persistent Logout Control */}
        <div className="sidebar__footer">
          <button
            className="sidebar__logout"
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            data-tooltip="Log out"
            title={isCollapsed ? "Log out" : undefined}
            aria-label="Log Out of system"
          >
            <LogOut size={19} strokeWidth={1.9} className="sidebar__link-icon" />
            {!isCollapsed && <span className="sidebar__link-label">Log out</span>}
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal dialog */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        user={user}
      />
    </>
  );
}
