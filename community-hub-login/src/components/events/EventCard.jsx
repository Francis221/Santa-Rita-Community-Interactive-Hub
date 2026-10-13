import React, { useState } from "react";
import { Calendar, Clock, MapPin, Users, Trash2, CheckCircle, Edit3 } from "lucide-react";
import { DB, resolveEventImage } from "../../services/db";
import { useAuth } from "../../context/AuthContext";
import EditEventModal from "./EditEventModal";
import annImg from "../photo/annimg.jpg";
import cleanImg from "../photo/clean.jpg";

export default function EventCard({ item, onDelete }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [isEditing, setIsEditing] = useState(false);
  const [joined, setJoined] = useState(false);
  const [count, setCount] = useState(item.attendeesCount || 12);

  // Resolve authentic community image for the event
  const displayImage = resolveEventImage ? resolveEventImage(item) : (item.image || annImg);

  // Handler: Delete event permanently (Admin only)
  const handleDelete = () => {
    if (window.confirm(`Delete event "${item.title}"?`)) {
      DB.deleteEvent(item.id);
      if (onDelete) onDelete();
    }
  };

  // Handler: Toggle joining/attending event
  const handleJoinToggle = () => {
    if (joined) {
      setJoined(false);
      setCount((prev) => prev - 1);
    } else {
      setJoined(true);
      setCount((prev) => prev + 1);
    }
  };

  const dateParts = (item.date || "Oct 15, 2026").split(" ");
  const monthStr = (dateParts[0] || "OCT").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
  const dayStr = dateParts[1] ? dateParts[1].replace(/[^0-9]/g, "") : "15";

  return (
    <div className="event-card">
      <div className="event-card__image-container">
        {/* Event Banner Photo: Displays authentic event photo */}
        <img
          src={displayImage}
          alt={item.title}
          className="event-card__image"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = item.id === "EVT-3" || item.title?.toLowerCase().includes("disaster") ? cleanImg : annImg;
          }}
        />
        <div className="event-card__date-badge">
          <div className="event-card__date-badge-day">{dayStr}</div>
          <div className="event-card__date-badge-month">{monthStr}</div>
        </div>
      </div>

      <div className="event-card__content">
        <span className="event-card__category">{item.category}</span>
        <h3 className="event-card__title">{item.title}</h3>
        <p className="event-card__desc">{item.description}</p>

        <div className="event-card__details">
          <div className="event-card__detail-item">
            <Clock size={14} style={{ color: "#38bdf8" }} />
            <span>{item.time}</span>
          </div>
          <div className="event-card__detail-item">
            <MapPin size={14} style={{ color: "#f43f5e" }} />
            <span>{item.location}</span>
          </div>
          <div className="event-card__detail-item">
            <Users size={14} style={{ color: "#10b981" }} />
            <span>Organized by {item.organizer}</span>
          </div>
        </div>

        <div className="event-card__footer">
          <button
            className={`btn-friend-action ${joined ? "btn-friend-friends" : "btn-friend-add"}`}
            style={{ flex: 1, marginRight: isAdmin ? 8 : 0 }}
            onClick={handleJoinToggle}
          >
            {joined ? (
              <>
                <CheckCircle size={16} /> Attending ({count})
              </>
            ) : (
              <>
                <Calendar size={16} /> Join Event ({count})
              </>
            )}
          </button>

          {isAdmin && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
                  padding: "0.5rem"
                }}
                title="Edit Event"
              >
                <Edit3 size={15} /> Edit
              </button>
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
                  padding: "0.5rem"
                }}
                title="Delete Event"
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <EditEventModal
          item={item}
          onClose={() => setIsEditing(false)}
          onUpdated={() => {
            setIsEditing(false);
            if (onDelete) onDelete();
          }}
        />
      )}
    </div>
  );
}
