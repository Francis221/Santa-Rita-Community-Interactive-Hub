import React, { useState } from "react";
import { DB } from "../../services/db";
import { X, Calendar } from "lucide-react";

export default function AddEventModal({ onClose, onAdded }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Community");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("9:00 AM");
  const [location, setLocation] = useState("Barangay Plaza");
  const [organizer, setOrganizer] = useState("Barangay Youth Council");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    let formattedDate = "Oct 28, 2026";
    if (date) {
      const [year, month, day] = date.split("-").map(Number);
      if (year && month && day) {
        const d = new Date(year, month - 1, day);
        formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
      }
    }

    DB.addEvent({
      title: title.trim(),
      category,
      date: formattedDate,
      time: time.trim(),
      location: location.trim(),
      organizer: organizer.trim(),
      description: description.trim(),
      image: image.trim() || undefined,
    });
    if (onAdded) onAdded();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chub-modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="chub-modal-title">📅 Add New Community Event</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>Event Title</label>
            <input
              type="text"
              placeholder="e.g. SK Inter-Purok Youth Sports League"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="modal-field">
              <label>Event Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Sports">Sports &amp; Recreation</option>
                <option value="Health">Health &amp; Wellness</option>
                <option value="Culture">Culture &amp; Youth</option>
                <option value="Safety">Safety &amp; Training</option>
                <option value="Senior Affairs">Senior Affairs</option>
              </select>
            </div>

            <div className="modal-field">
              <label>Event Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="modal-field">
              <label>Time</label>
              <input
                type="text"
                placeholder="e.g. 9:00 AM - 12:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label>Organizer</label>
              <input
                type="text"
                placeholder="e.g. SK Council / BFP"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-field">
            <label>Location / Venue</label>
            <input
              type="text"
              placeholder="e.g. Sta. Rita Covered Court"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="modal-field">
            <label>Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label>Event Description</label>
            <textarea
              rows={3}
              placeholder="Describe the event activities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-modal-submit">
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
