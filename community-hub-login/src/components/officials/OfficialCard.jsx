import React from "react";
import { Phone, Mail, Edit3, Power, UserCheck } from "lucide-react";
import captainFallback from "../photo/Punong_barangay.png";

export default function OfficialCard({
  official,
  isAdmin,
  onEdit,
  onToggleActive,
}) {
  const {
    id,
    name,
    position,
    committee,
    photo,
    phone,
    email,
    is_active,
    rank_order,
  } = official;

  const displayPhoto = photo || captainFallback;

  return (
    <div
      className={`official-card ${!is_active ? "official-card--inactive" : ""}`}
      style={{
        opacity: is_active ? 1 : 0.65,
        position: "relative",
      }}
    >
      {/* Rank indicator badge */}
      <span
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          fontSize: "10px",
          fontWeight: 700,
          background: "#0f172a",
          border: "1px solid #334155",
          color: "#94a3b8",
          padding: "2px 6px",
          borderRadius: "10px",
        }}
      >
        Rank #{rank_order}
      </span>

      {/* Inactive flag */}
      {!is_active && (
        <span
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            fontSize: "10px",
            fontWeight: 700,
            background: "#fee2e2",
            border: "1px solid #f87171",
            color: "#b91c1c",
            padding: "2px 6px",
            borderRadius: "10px",
          }}
        >
          Inactive
        </span>
      )}

      {/* Official Photo */}
      <img
        src={displayPhoto}
        alt={name}
        className="official-card__photo"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = captainFallback;
        }}
      />

      <h3 className="official-card__name">{name}</h3>
      <span className="official-card__role">{position}</span>
      <span className="official-card__committee">{committee || "Council Governance"}</span>

      {/* Public Contact Links (NO chat shortcut) */}
      <div className="official-card__actions">
        {phone ? (
          <a
            className="btn-official-contact"
            href={`tel:${phone}`}
            title={`Call office: ${phone}`}
          >
            <Phone size={13} /> {phone}
          </a>
        ) : email ? (
          <a
            className="btn-official-contact"
            href={`mailto:${email}`}
            title={`Email: ${email}`}
          >
            <Mail size={13} /> Contact Email
          </a>
        ) : (
          <div
            className="btn-official-contact"
            style={{ cursor: "default", opacity: 0.7 }}
          >
            <UserCheck size={13} /> Sta. Rita Council
          </div>
        )}
      </div>

      {/* Admin Management Controls */}
      {isAdmin && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            width: "100%",
            marginTop: "10px",
            paddingTop: "10px",
            borderTop: "1px solid #334155",
          }}
        >
          <button
            type="button"
            className="btn-official-contact"
            style={{
              background: "#1e3a8a",
              borderColor: "#3b82f6",
              color: "#93c5fd",
            }}
            onClick={() => onEdit(official)}
            title="Edit Official details"
          >
            <Edit3 size={13} /> Edit
          </button>

          <button
            type="button"
            className="btn-official-contact"
            style={{
              background: is_active ? "#450a0a" : "#064e3b",
              borderColor: is_active ? "#ef4444" : "#10b981",
              color: is_active ? "#fca5a5" : "#6ee7b7",
            }}
            onClick={() => onToggleActive(official)}
            title={is_active ? "Deactivate Official" : "Activate Official"}
          >
            <Power size={13} /> {is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
      )}
    </div>
  );
}
