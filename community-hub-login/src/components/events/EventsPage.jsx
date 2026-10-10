import React, { useState, useEffect } from "react";
import { DB } from "../../services/db";
import EventCard from "./EventCard";
import AddEventModal from "./AddEventModal";
import { Calendar, Plus } from "lucide-react";
import "./events.css";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const refreshEvents = () => {
    setEvents(DB.getEvents());
  };

  useEffect(() => {
    refreshEvents();
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

        <button className="btn-add-event" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>Add Event</span>
        </button>
      </div>

      <div className="events-grid">
        {events.map((item) => (
          <EventCard key={item.id} item={item} onDelete={refreshEvents} />
        ))}
      </div>

      {showModal && (
        <AddEventModal onClose={() => setShowModal(false)} onAdded={refreshEvents} />
      )}
    </div>
  );
}
