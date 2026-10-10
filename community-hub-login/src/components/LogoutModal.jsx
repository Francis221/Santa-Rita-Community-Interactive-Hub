import React, { useState, useEffect } from "react";
import { LogOut, X, Shield, User, Loader2 } from "lucide-react";
import "./LogoutModal.css";

export default function LogoutModal({ isOpen, onClose, onConfirm, user }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isLoggingOut) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoggingOut, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await onConfirm();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.username || "Resident User";
  const userRole = user?.role || "Resident";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <div
      className="logout-modal__overlay"
      onClick={!isLoggingOut ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div
        className="logout-modal__card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="logout-modal__close"
          onClick={onClose}
          disabled={isLoggingOut}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="logout-modal__icon-wrap">
          <LogOut size={32} strokeWidth={2.2} />
        </div>

        <h2 id="logout-modal-title" className="logout-modal__title">
          Sign Out of Community Hub?
        </h2>

        <p className="logout-modal__desc">
          Are you sure you want to end your current session? You will be redirected to the login page.
        </p>

        <div className="logout-modal__user-badge">
          <div className="logout-modal__avatar">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="logout-modal__avatar-img"
              />
            ) : (
              initials
            )}
          </div>
          <div className="logout-modal__user-meta">
            <div className="logout-modal__user-name">{displayName}</div>
            <span
              className={`logout-modal__user-role ${
                userRole === "Admin" ? "logout-modal__user-role--admin" : ""
              }`}
            >
              {userRole === "Admin" ? <Shield size={12} /> : <User size={12} />}
              {userRole} Account
            </span>
          </div>
        </div>

        <div className="logout-modal__actions">
          <button
            type="button"
            className="logout-modal__btn logout-modal__btn--cancel"
            onClick={onClose}
            disabled={isLoggingOut}
          >
            Cancel
          </button>
          <button
            type="button"
            className="logout-modal__btn logout-modal__btn--confirm"
            onClick={handleConfirm}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing Out...
              </>
            ) : (
              <>
                <LogOut size={16} />
                Log Out
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
