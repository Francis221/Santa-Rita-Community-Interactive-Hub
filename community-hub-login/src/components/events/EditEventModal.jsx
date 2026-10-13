import React, { useState } from "react";
import { X, Calendar, Clock, MapPin, Upload, AlertCircle } from "lucide-react";
import { DB } from "../../services/db";

export default function EditEventModal({ item, onClose, onUpdated }) {
  const [title, setTitle] = useState(item.title || "");
  const [category, setCategory] = useState(item.category || "Community");
  const [description, setDescription] = useState(item.description || "");

  // Date parsing: e.g. "Oct 12, 2026" -> YYYY-MM-DD
  const parseDateToInput = (dStr) => {
    if (!dStr) return "";
    const parsed = new Date(dStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
    return "";
  };

  const [date, setDate] = useState(() => parseDateToInput(item.date || item.event_date));

  // Time parsing: e.g. item.time could be "04:00 PM - 07:00 PM" or separate
  const [startTime, setStartTime] = useState(() => {
    if (item.start_time) return item.start_time;
    if (item.time && item.time.includes("-")) {
      return item.time.split("-")[0].trim();
    }
    return item.time || "09:00 AM";
  });

  const [endTime, setEndTime] = useState(() => {
    if (item.end_time) return item.end_time;
    if (item.time && item.time.includes("-")) {
      return item.time.split("-")[1].trim();
    }
    return "12:00 PM";
  });

  const [location, setLocation] = useState(item.location || "Barangay Plaza");
  const [organizer, setOrganizer] = useState(item.organizer || "Barangay Council");

  // File upload state for image replacement
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item.image || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Event image cannot exceed 5MB.");
        return;
      }
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(file.type)) {
        setError("Invalid image format. Only JPG, PNG, WEBP, and GIF are allowed.");
        return;
      }
      setError("");
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please provide an event title.");
      return;
    }
    if (!date) {
      setError("Please select an event date.");
      return;
    }

    // Time validation: End time must not be chronologically before Start time
    const startParsed = new Date(`2026-01-01 ${startTime}`);
    const endParsed = new Date(`2026-01-01 ${endTime}`);
    if (!isNaN(startParsed.getTime()) && !isNaN(endParsed.getTime())) {
      if (endParsed.getTime() < startParsed.getTime()) {
        setError("Event end time cannot be earlier than start time.");
        return;
      }
    }

    setSaving(true);

    let formattedDate = date;
    const [year, month, day] = date.split("-").map(Number);
    if (year && month && day) {
      const d = new Date(year, month - 1, day);
      formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    }

    try {
      const formData = new FormData();
      formData.append("id", item.id || item.event_code);
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("description", description.trim());
      formData.append("date", formattedDate);
      formData.append("event_date", formattedDate);
      formData.append("start_time", startTime.trim());
      formData.append("end_time", endTime.trim());
      formData.append("location", location.trim());
      formData.append("organizer", organizer.trim());

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/events.php?action=update", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to update event.");
        setSaving(false);
        return;
      }

      // Live update in local storage & dispatch event
      const updatedEvent = {
        ...item,
        title: title.trim(),
        category,
        description: description.trim(),
        date: formattedDate,
        event_date: formattedDate,
        time: `${startTime.trim()} - ${endTime.trim()}`,
        start_time: startTime.trim(),
        end_time: endTime.trim(),
        location: location.trim(),
        organizer: organizer.trim(),
        image: data.event?.image || imagePreview || item.image,
      };

      const allEvents = DB.getEvents();
      const updatedList = allEvents.map((ev) =>
        ev.id === item.id ? updatedEvent : ev
      );
      localStorage.setItem("chub_db_events", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("eventsUpdated"));

      alert("Event updated successfully!");
      if (onUpdated) onUpdated(updatedEvent);
      onClose();
    } catch (err) {
      setError("Network error while updating event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chub-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", width: "95%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h2 className="chub-modal-title" style={{ margin: 0 }}>
            ✏️ Edit Community Event
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: 0, marginBottom: "16px" }}>
          Modify schedule, location, or cover image. Residents are notified of date changes.
        </p>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #f87171",
              color: "#b91c1c",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Current Image and File Replacement */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "56px",
                borderRadius: "8px",
                background: "#e2e8f0",
                overflow: "hidden",
                border: "1px solid #cbd5e1",
                flexShrink: 0,
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Event preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "10px" }}>
                  No Image
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#334155",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                REPLACE EVENT PHOTO (JPG, PNG, WEBP - MAX 5MB)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                style={{ fontSize: "12px" }}
              />
            </div>
          </div>

          <div className="modal-field">
            <label>Event Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SK Inter-Purok Youth Sports League"
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
                <option value="Community">General Community</option>
              </select>
            </div>

            <div className="modal-field">
              <label>Event Date *</label>
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
              <label>Start Time</label>
              <input
                type="text"
                placeholder="e.g. 09:00 AM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label>End Time (Cannot be before Start)</label>
              <input
                type="text"
                placeholder="e.g. 12:00 PM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="modal-field">
              <label>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sta. Rita Covered Court"
              />
            </div>

            <div className="modal-field">
              <label>Organizer</label>
              <input
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. SK Youth Council"
              />
            </div>
          </div>

          <div className="modal-field">
            <label>Event Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive description of the community event..."
            ></textarea>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #cbd5e1",
                background: "#f1f5f9",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2,
                padding: "10px",
                background: "#0284c7",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {saving ? "Saving Changes..." : "Save Event Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
