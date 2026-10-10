import React from "react";
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Only Admin accounts see Reports
  const visibleLinks = sidebarLinks.filter((link) => {
    if (link.id === "reports" && user?.role !== "Admin") {
      return false;
    }
    return true;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar__brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <div className="sidebar__logo">
          <img
            src="/src/components/photo/logostarita.jpg"
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

      <nav className="sidebar__nav" aria-label="Main">
        <ul>
          {visibleLinks.map((link) => {
            const Icon = ICONS[link.icon] || User;
            return (
              <li key={link.id}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    "sidebar__link" + (isActive ? " sidebar__link--active" : "")
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{link.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <button className="sidebar__logout" type="button" onClick={handleLogout}>
        <LogOut size={18} strokeWidth={1.8} />
        <span>Log out</span>
      </button>
    </aside>
  );
}
