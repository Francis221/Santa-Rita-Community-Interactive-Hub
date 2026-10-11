import React from "react";
import { Calendar, MapPin, Trash2 } from "lucide-react";
import { DB, resolveAnnouncementImage } from "../../services/db";
import { useAuth } from "../../context/AuthContext";
import genassembly from "../photo/genassembly.jpg";

export default function AnnouncementCard({ item, onDelete }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  // Resolve the true authentic image asset for the announcement
  const displayImage = resolveAnnouncementImage ? resolveAnnouncementImage(item) : (item.image || genassembly);

  // Handler: Delete announcement (Admin only)
  const handleDelete = () => {
    if (window.confirm(`Delete announcement "${item.title}"?`)) {
      DB.deleteAnnouncement(item.id);
      if (onDelete) onDelete();
    }
  };

  return (
    <div className="announcement-card">
      {/* Announcement Cover Photo: Displays true authentic event picture */}
      <img
        src={displayImage}
        alt={item.title}
        className="announcement-card__image"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = genassembly;
        }}
      />
      <div className="announcement-card__content">
        <div className="announcement-card__meta">
          <span className="announcement-card__badge">{item.badge || item.category}</span>
          <span className="announcement-card__date">{item.date}</span>
        </div>

        <h3 className="announcement-card__title">{item.title}</h3>
        <p className="announcement-card__body">{item.content}</p>

        <div className="announcement-card__footer">
          <span>📍 {item.location}</span>
          {isAdmin && (
            /* Button: Delete announcement permanently (Admin only) */
            <button
              onClick={handleDelete}
              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              title="Delete Announcement"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

