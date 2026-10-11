import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  User,
  Megaphone,
  Calendar,
  UserPlus,
  FolderKanban,
  BarChart3,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { barangay, sidebarLinks } from "../constants/hubConfig";
import { useAuth } from "../context/AuthContext";
import LogoutModal from "./LogoutModal";
import "./Sidebar.css";

const ICONS = {
  User,
  Megaphone,
  Calendar,
  UserPlus,
  FolderKanban,
  BarChart3,
  FileText,
  Settings,
};

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsLogoutModalOpen(true);
    window.addEventListener("openLogoutModal", handleOpenModal);
    return () => window.removeEventListener("openLogoutModal", handleOpenModal);
  }, []);

  const handleConfirmLogout = async () => {
    await logout();
    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  const visibleLinks = sidebarLinks;

  return (
    <>
      {/* Desktop Sidebar Navigation Container */}
      <aside className="sidebar">
        {/* Barangay Branding Header (Clicking navigates to Home) */}
        <div className="sidebar__brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <div className="sidebar__logo">
            <img
              src={barangay.photo || "/photo/logostarita.jpg"}
              alt="Barangay Sta. Rita Logo"
              className="sidebar__logo-img"
            />
          </div>
          <p className="sidebar__title">
            {barangay.name.split(" ")[0].toUpperCase()}
            <span> {barangay.name.split(" ").slice(1).join(" ").toUpperCase()}</span>
          </p>
          <p className="sidebar__subtitle">{barangay.municipality.toUpperCase()}</p>
        </div>

        {/* Primary Sidebar Navigation Menu */}
        <nav className="sidebar__nav" aria-label="Sidebar Main Navigation">
          <ul>
            {visibleLinks.map((link) => {
              const Icon = ICONS[link.icon] || User;
              return (
                <li key={link.id}>
                  {/* Navigation link for each specific module */}
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      "sidebar__link" + (isActive ? " sidebar__link--active" : "")
                    }
                    title={`Go to ${link.label}`}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    <span>{link.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Button to open logout modal */}
        <button
          className="sidebar__logout"
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          title="Sign out of Community Hub"
          aria-label="Log Out of system"
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span>Log out</span>
        </button>
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
