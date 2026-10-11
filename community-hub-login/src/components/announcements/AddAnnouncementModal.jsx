import React, { useState } from "react";
import { DB } from "../../services/db";
import { X, Megaphone, Upload } from "lucide-react";
import genassembly from "../photo/genassembly.jpg";

export default function AddAnnouncementModal({ onClose, onAdded }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Official Notice");
  const [badge, setBadge] = useState("Important");
  const [location, setLocation] = useState("Barangay Sta. Rita Central");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    DB.addAnnouncement({
      title,
      category,
      badge,
      location,
      content,
      image: image || genassembly,
    });
    if (onAdded) onAdded();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chub-modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="chub-modal-title">📢 Post New Announcement</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>Announcement Title</label>
            <input
              type="text"
              placeholder="e.g. Barangay General Assembly Meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="modal-field">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Official Notice">Official Notice</option>
                <option value="Health & Services">Health &amp; Services</option>
                <option value="Environment">Environment</option>
                <option value="Security & Safety">Security &amp; Safety</option>
              </select>
            </div>

            <div className="modal-field">
              <label>Badge Tag</label>
              <select value={badge} onChange={(e) => setBadge(e.target.value)}>
                <option value="Important">Important</option>
                <option value="Public Service">Public Service</option>
                <option value="Urgent">Urgent</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </div>
          </div>

          <div className="modal-field">
            <label>Location / Venue</label>
            <input
              type="text"
              placeholder="e.g. Barangay Gymnasium"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Upload size={14} /> Upload Banner Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                backgroundColor: "#1e293b",
                border: "1px dashed #475569",
                padding: "8px 12px",
                borderRadius: "8px",
                color: "#cbd5e1",
                width: "100%",
                cursor: "pointer"
              }}
            />
            {imagePreview && (
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <img
                  src={imagePreview}
                  alt="Uploaded Banner Preview"
                  style={{
                    maxHeight: "140px",
                    width: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #3b82f6"
                  }}
                />
              </div>
            )}
          </div>

          <div className="modal-field">
            <label>Announcement Details &amp; Description</label>
            <textarea
              rows={4}
              placeholder="Enter full details of the announcement..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-modal-submit">
              Post Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
