import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  HelpCircle,
  ShieldCheck,
  UserPlus,
  Menu,
  CheckCheck,
  Megaphone,
  MessageCircle,
} from "lucide-react";
import { navLinks } from "../constants/hubConfig";
import { useAuth } from "../context/AuthContext";
import { DB } from "../services/db";
import communityLogo from "../logo/community-c-logo-transparent.png";
import "./Navbar.css";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Notification State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const refreshFriendCount = () => {
    setPendingRequestsCount(DB.getPendingFriendRequestsCount());
  };

  // Fetch notifications from backend endpoint
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications.php", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadCount(typeof data.unread_count === "number" ? data.unread_count : 0);
        }
      }
    } catch (e) {
      // Backend spinup or network glitch
    }
  };

  useEffect(() => {
    refreshFriendCount();
    window.addEventListener("friendsUpdated", refreshFriendCount);

    fetchNotifications();
    window.addEventListener("notificationsUpdated", fetchNotifications);

    // Poll every 35-45 seconds for new community notifications
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 40000);

    return () => {
      window.removeEventListener("friendsUpdated", refreshFriendCount);
      window.removeEventListener("notificationsUpdated", fetchNotifications);
      clearInterval(pollInterval);
    };
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };

    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen]);

  // Click on a single notification: mark read and route
  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await fetch("/api/notifications.php?action=mark_read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: notif.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {}
    }
    setIsNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications.php?action=mark_all_read", {
        method: "POST",
        credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleToggleMobileMenu = () => {
    window.dispatchEvent(new Event("toggleMobileMenu"));
  };

  const displayName = user?.username || "Resident";
  const userRole = user?.role || "Resident";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="navbar">
      {/* Mobile Hamburger Menu Toggle Button */}
      <button
        type="button"
        className="navbar__mobile-toggle"
        onClick={handleToggleMobileMenu}
        aria-label="Toggle navigation drawer"
        title="Open Navigation Menu"
      >
        <Menu size={22} />
      </button>

      {/* Brand logo & community title (Clicking navigates to Home) */}
      <div className="navbar__brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <span className="navbar__mark">
          <img
            src={communityLogo}
            alt="Barangay Logo"
            style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
          />
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

        {/* Chat button — navigate to community messages */}
        <button
          className="navbar__icon-btn"
          type="button"
          aria-label="Community Chats"
          title="Community Chats & Messages"
          onClick={() => navigate("/chats")}
        >
          <MessageCircle size={18} strokeWidth={1.8} />
        </button>

        {/* Emergency Hotlines / Help */}
        <button
          className="navbar__icon-btn"
          type="button"
          aria-label="Emergency hotlines"
          title="Emergency hotlines & help"
          onClick={() => {
            const el = document.getElementById("hotlines-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
            else navigate("/");
          }}
        >
          <HelpCircle size={18} strokeWidth={1.8} />
        </button>

        {/* Notification Bell with Dropdown Container */}
        <div className="navbar__notif-wrapper" ref={notifRef} style={{ position: "relative" }}>
          <button
            className={`navbar__icon-btn ${isNotifOpen ? "navbar__icon-btn--active" : ""}`}
            type="button"
            aria-label="Notifications"
            title="Notifications & Alerts"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            style={{ position: "relative" }}
          >
            <Bell size={18} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="navbar__notif-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="navbar__notif-dropdown">
              <div className="notif-dropdown__header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span className="notif-dropdown__unread-pill">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="notif-dropdown__mark-all-btn"
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} style={{ marginRight: 4 }} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-dropdown__list">
                {notifications.length === 0 ? (
                  <div className="notif-dropdown__empty">
                    <Megaphone size={32} color="#64748b" style={{ marginBottom: 8 }} />
                    <p style={{ margin: 0, fontWeight: 600, color: "#cbd5e1" }}>No notifications</p>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      You're all caught up with community updates.
                    </span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-dropdown__item ${
                        !n.is_read ? "notif-dropdown__item--unread" : ""
                      }`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="notif-dropdown__item-content">
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                          <span className="notif-dropdown__item-title">{n.title}</span>
                          {!n.is_read && <span className="notif-dropdown__dot" />}
                        </div>
                        <p className="notif-dropdown__item-message">{n.message}</p>
                        <span className="notif-dropdown__item-time">{n.time_formatted || n.created_at}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile card (Clicking opens user profile page) */}
        <div className="navbar__user" title="View Profile" onClick={() => navigate("/profile")}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <span className="navbar__avatar">{initials}</span>
          )}
          <div className="navbar__user-copy">
            <span className="navbar__user-name">{displayName}</span>
            <span className="navbar__user-role">
              <ShieldCheck
                size={12}
                style={{
                  display: "inline",
                  marginRight: 3,
                  verticalAlign: "middle",
                  color: userRole === "Admin" ? "#10b981" : "#3b82f6",
                }}
              />
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
