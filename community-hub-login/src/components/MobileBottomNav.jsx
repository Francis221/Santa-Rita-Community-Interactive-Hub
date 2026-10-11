import React from "react";
import { NavLink } from "react-router-dom";
import { Home, MessageSquare, FileText, BarChart3, Menu } from "lucide-react";
import "./MobileBottomNav.css";

/**
 * MobileBottomNav Component
 * Provides a responsive, sleek, floating bottom navigation bar on mobile viewports (<= 900px).
 * Allows single-tap access to primary modules: Home, Chats, Request Documents, Reports, and Full Menu drawer.
 */
export default function MobileBottomNav({ onToggleMenu, isMenuOpen }) {
  return (
    /* Bottom Navigation Bar Container for Mobile Devices */
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <div className="mobile-bottom-nav__inner">
        {/* Navigation Button: Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            "mobile-bottom-nav__item" + (isActive ? " mobile-bottom-nav__item--active" : "")
          }
          title="Home Page"
        >
          <Home size={20} strokeWidth={2} />
          <span className="mobile-bottom-nav__label">Home</span>
        </NavLink>

        {/* Navigation Button: Community Chats */}
        <NavLink
          to="/chats"
          className={({ isActive }) =>
            "mobile-bottom-nav__item" + (isActive ? " mobile-bottom-nav__item--active" : "")
          }
          title="Community Chats"
        >
          <MessageSquare size={20} strokeWidth={2} />
          <span className="mobile-bottom-nav__label">Chats</span>
        </NavLink>

        {/* Navigation Button: Request Documents & Certificates */}
        <NavLink
          to="/request-document"
          className={({ isActive }) =>
            "mobile-bottom-nav__item" + (isActive ? " mobile-bottom-nav__item--active" : "")
          }
          title="Request Document"
        >
          <FileText size={20} strokeWidth={2} />
          <span className="mobile-bottom-nav__label">Docs</span>
        </NavLink>

        {/* Navigation Button: Community Reports & Cases */}
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            "mobile-bottom-nav__item" + (isActive ? " mobile-bottom-nav__item--active" : "")
          }
          title="Case Reports"
        >
          <BarChart3 size={20} strokeWidth={2} />
          <span className="mobile-bottom-nav__label">Reports</span>
        </NavLink>

        {/* Action Button: Toggle Full Mobile Menu Drawer */}
        <button
          type="button"
          className={`mobile-bottom-nav__item mobile-bottom-nav__item--btn ${
            isMenuOpen ? "mobile-bottom-nav__item--active" : ""
          }`}
          onClick={onToggleMenu}
          title="Open Full Navigation Menu"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} strokeWidth={2} />
          <span className="mobile-bottom-nav__label">Menu</span>
        </button>
      </div>
    </nav>
  );
}
