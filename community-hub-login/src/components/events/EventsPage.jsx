import React, { useState, useEffect } from "react";
import { DB } from "../../services/db";
import EventCard from "./EventCard";
import AddEventModal from "./AddEventModal";
import { Calendar, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./events.css";

export default function EventsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const refreshEvents = () => {
    setEvents(DB.getEvents());
  };

  useEffect(() => {
    refreshEvents();
    DB.fetchEventsFromApi().then((data) => {
      if (data && Array.isArray(data)) setEvents(data);
    });
    const handleUpdate = () => refreshEvents();
    window.addEventListener("eventsUpdated", handleUpdate);
    return () => window.removeEventListener("eventsUpdated", handleUpdate);
  }, []);

  return (
    <div className="page events-page">
      <div className="events-header">
        <div>
          <h1>Community Events Calendar</h1>
          <p>Upcoming sports leagues, health checkups, and youth activities in Sta. Rita Central.</p>
        </div>

        {isAdmin && (
          <button className="btn-add-event" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            <span>Add Event</span>
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="empty-state" style={{ textAlign: "center", padding: "3rem 1rem", background: "white", borderRadius: "12px", border: "1px dashed #cbd5e1", margin: "1.5rem 0" }}>
          <Calendar size={48} color="#94a3b8" style={{ marginBottom: "1rem" }} />
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#1e293b" }}>No Events Scheduled</h3>
          <p style={{ color: "#64748b", margin: 0 }}>There are currently no upcoming community events.</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((item) => (
            <EventCard key={item.id} item={item} onDelete={refreshEvents} />
          ))}
        </div>
      )}

      {showModal && (
        <AddEventModal onClose={() => setShowModal(false)} onAdded={refreshEvents} />
      )}
    </div>
  );
}
