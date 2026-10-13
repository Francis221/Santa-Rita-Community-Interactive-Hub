import React, { useState } from "react";
import { Trash2, Edit3 } from "lucide-react";
import { DB, resolveAnnouncementImage } from "../../services/db";
import { useAuth } from "../../context/AuthContext";
import EditAnnouncementModal from "./EditAnnouncementModal";
import genassembly from "../photo/genassembly.jpg";

export default function AnnouncementCard({ item, onDelete, onUpdate }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [isEditing, setIsEditing] = useState(false);

  // Resolve authentic or uploaded image asset
  const displayImage = resolveAnnouncementImage ? resolveAnnouncementImage(item) : (item.image || genassembly);

  // Handler: Delete announcement (Admin only)
  const handleDelete = () => {
    if (window.confirm(`Delete announcement "${item.title}"?`)) {
      DB.deleteAnnouncement(item.id);
      if (onDelete) onDelete();
    }
  };

  const handleUpdated = () => {
    if (onUpdate) onUpdate();
    else if (onDelete) onDelete();
  };

  return (
    <>
      <div className="announcement-card">
        {/* Announcement Cover Photo */}
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
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Button: Edit announcement */}
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#60a5fa",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                  title="Edit Announcement"
                >
                  <Edit3 size={14} /> Edit
                </button>

                {/* Button: Delete announcement */}
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                  title="Delete Announcement"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <EditAnnouncementModal
          item={item}
          onClose={() => setIsEditing(false)}
          onUpdated={handleUpdated}
        />
      )}
    </>
  );
}
