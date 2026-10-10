import React, { useState } from "react";
import { Calendar, Clock, MapPin, Users, Trash2, CheckCircle } from "lucide-react";
import { DB } from "../../services/db";
import { useAuth } from "../../context/AuthContext";

export default function EventCard({ item, onDelete }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [joined, setJoined] = useState(false);
  const [count, setCount] = useState(item.attendeesCount || 12);

  const handleDelete = () => {
    if (window.confirm(`Delete event "${item.title}"?`)) {
      DB.deleteEvent(item.id);
      if (onDelete) onDelete();
    }
  };

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
        <img src={item.image} alt={item.title} className="event-card__image" />
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
            <button
              onClick={handleDelete}
              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.5rem" }}
              title="Delete Event"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
