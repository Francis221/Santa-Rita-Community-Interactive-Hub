import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, Bell, HelpCircle, ShieldCheck, UserPlus, LogOut } from "lucide-react";
import { navLinks } from "../constants/hubConfig";
import { useAuth } from "../context/AuthContext";
import { DB } from "../services/db";
import "./Navbar.css";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const refreshCount = () => {
    setPendingRequestsCount(DB.getPendingFriendRequestsCount());
  };

  useEffect(() => {
    refreshCount();
    window.addEventListener("friendsUpdated", refreshCount);
    return () => window.removeEventListener("friendsUpdated", refreshCount);
  }, []);

  const displayName = user?.username || "User";
  const userRole = user?.role || "Resident";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="navbar">
      <div className="navbar__brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <span className="navbar__mark">
          <img src="./src/logo/community-c-logo-transparent.png" alt="Barangay Logo" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
        </span>
        <span className="navbar__name">Community Hub</span>
      </div>

      <nav className="navbar__links" aria-label="Primary">
        {navLinks.map((link) => (
          <NavLink
            key={link.id}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              "navbar__link" + (isActive ? " navbar__link--active" : "")
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="navbar__actions">
        <div className="navbar__search">
          <Search size={16} strokeWidth={2} />
          <input type="search" placeholder="Search residents..." aria-label="Search the hub" onClick={() => navigate("/find-friends")} />
        </div>

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
            <span style={{
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
            }}>
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button className="navbar__icon-btn" type="button" aria-label="Help">
          <HelpCircle size={18} strokeWidth={1.8} />
        </button>
        <button className="navbar__icon-btn" type="button" aria-label="Notifications">
          <Bell size={18} strokeWidth={1.8} />
          <span className="navbar__dot" />
        </button>

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

        <button
          className="navbar__icon-btn"
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
  );
}
