import React, { useState } from "react";
import { DB } from "../../services/db";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import genassembly from "../photo/genassembly.jpg";

export default function AddAnnouncementModal({ onClose, onAdded }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Official Notice");
  const [badge, setBadge] = useState("Important");
  const [location, setLocation] = useState("Barangay Sta. Rita Central");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleImageChange = (e) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (file) {
      // Validate 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Selected image exceeds 5MB size limit.");
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

    if (!title.trim() || !content.trim()) {
      setErrorMsg("Title and content are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("badge", badge);
      formData.append("location", location.trim());
      formData.append("content", content.trim());
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await DB.addAnnouncement(formData, {
        title,
        category,
        badge,
        location,
        content,
        imagePreview: imagePreview || genassembly,
      });

      if (onAdded) onAdded();
      onClose();
    } catch (err) {
      setErrorMsg("Failed to post announcement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chub-modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="chub-modal-title">📢 Post New Announcement</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              color: "#f87171",
              fontSize: "13px",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              padding: "8px 12px",
              borderRadius: "6px",
              margin: "12px 0",
              border: "1px solid rgba(239, 68, 68, 0.25)",
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="modal-field">
            <label>Announcement Title</label>
            <input
              type="text"
              placeholder="e.g. Barangay General Assembly Meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="modal-field">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="Official Notice">Official Notice</option>
                <option value="Health & Services">Health &amp; Services</option>
                <option value="Environment">Environment</option>
                <option value="Security & Safety">Security &amp; Safety</option>
              </select>
            </div>

            <div className="modal-field">
              <label>Badge Tag</label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                disabled={isSubmitting}
              >
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
              disabled={isSubmitting}
            />
          </div>

          {/* File input for banner image */}
          <div className="modal-field">
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Upload size={14} /> Upload Banner Image (Max 5MB)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isSubmitting}
              style={{
                backgroundColor: "#1e293b",
                border: "1px dashed #475569",
                padding: "8px 12px",
                borderRadius: "8px",
                color: "#cbd5e1",
                width: "100%",
                cursor: "pointer",
              }}
            />
            {imagePreview ? (
              <div style={{ marginTop: 8, textAlign: "center", position: "relative" }}>
                <img
                  src={imagePreview}
                  alt="Live Preview"
                  style={{
                    maxHeight: "150px",
                    width: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #3b82f6",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    background: "rgba(15, 23, 42, 0.8)",
                    color: "#93c5fd",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  Live Preview
                </span>
              </div>
            ) : (
              <small style={{ color: "#94a3b8", fontSize: "11px", marginTop: 4 }}>
                Supports JPG, PNG, WEBP, GIF. Default photo will be used if none uploaded.
              </small>
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
              disabled={isSubmitting}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin" style={{ marginRight: 6 }} /> Posting...
                </>
              ) : (
                "Post Announcement"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
