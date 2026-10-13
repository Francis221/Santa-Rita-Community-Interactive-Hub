import React, { useState } from "react";
import { DB } from "../../services/db";
import { X, Calendar, Upload, AlertCircle, Loader2 } from "lucide-react";

export default function AddEventModal({ onClose, onAdded }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Community");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("9:00 AM - 12:00 PM");
  const [location, setLocation] = useState("Barangay Plaza");
  const [organizer, setOrganizer] = useState("Barangay Youth Council");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Selected image exceeds 5MB size limit.");
        return;
      }
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(file.type)) {
        setErrorMsg("Invalid image format. Only JPG, PNG, WEBP, and GIF are allowed.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Please provide an event title.");
      return;
    }
    if (!date) {
      setErrorMsg("Please select an event date.");
      return;
    }

    setIsSubmitting(true);

    let formattedDate = date;
    const [year, month, day] = date.split("-").map(Number);
    if (year && month && day) {
      const d = new Date(year, month - 1, day);
      formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    }

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("date", formattedDate);
      formData.append("event_date", formattedDate);
      formData.append("time", time.trim());
      formData.append("location", location.trim());
      formData.append("organizer", organizer.trim());
      formData.append("description", description.trim());
      formData.append("user_role", "Admin");

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrl.trim()) {
        formData.append("image", imageUrl.trim());
      }

      await DB.addEvent(formData, {
        imagePreview: imagePreview || imageUrl.trim() || undefined,
      });

      if (onAdded) onAdded();
      onClose();
    } catch (err) {
      setErrorMsg("Failed to save event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chub-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="chub-modal-title">📅 Add New Community Event</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.75rem", borderRadius: "8px", margin: "1rem 0" }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: "0.875rem" }}>{errorMsg}</span>
          </div>
        )}

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
                <option value="Community">Community Event</option>
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

          {/* Event Image Upload */}
          <div className="modal-field">
            <label>Event Photo (Upload or Link)</label>
            <div style={{ border: "2px dashed #cbd5e1", borderRadius: "8px", padding: "1rem", textAlign: "center", background: "#f8fafc", cursor: "pointer" }} onClick={() => document.getElementById("event-file-input")?.click()}>
              <input
                id="event-file-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="Preview" style={{ maxHeight: "150px", maxWidth: "100%", borderRadius: "6px", objectFit: "cover" }} />
                  <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>Click to replace photo</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: "#64748b" }}>
                  <Upload size={28} color="#94a3b8" />
                  <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Click to upload event image</span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>JPG, PNG, WEBP (Max 5MB)</span>
                </div>
              )}
            </div>
            {!imagePreview && (
              <input
                type="url"
                placeholder="Or paste image URL (https://images.unsplash.com/...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ marginTop: "0.5rem" }}
              />
            )}
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
            <button type="button" className="btn-modal-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-modal-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                "Save Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
