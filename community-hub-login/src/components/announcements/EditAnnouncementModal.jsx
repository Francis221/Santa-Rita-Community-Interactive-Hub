import React, { useState } from "react";
import { DB, resolveAnnouncementImage } from "../../services/db";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import genassembly from "../photo/genassembly.jpg";

export default function EditAnnouncementModal({ item, onClose, onUpdated }) {
  const [title, setTitle] = useState(item?.title || "");
  const [category, setCategory] = useState(item?.category || "Official Notice");
  const [badge, setBadge] = useState(item?.badge || "Important");
  const [location, setLocation] = useState(item?.location || "Barangay Sta. Rita Central");
  const [content, setContent] = useState(item?.content || "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currentDisplayImage = resolveAnnouncementImage ? resolveAnnouncementImage(item) : (item?.image || genassembly);

  const handleImageChange = (e) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (file) {
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
      formData.append("id", item.id);
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("badge", badge);
      formData.append("location", location.trim());
      formData.append("content", content.trim());
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await DB.updateAnnouncement(formData, {
        id: item.id,
        title,
        category,
        badge,
        location,
        content,
        imagePreview: imagePreview || currentDisplayImage,
      });

      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      setErrorMsg("Failed to update announcement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chub-modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="chub-modal-title">✏️ Edit Announcement</h2>
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Current and Replace Image Section */}
          <div className="modal-field">
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Upload size={14} /> Replace Banner Image (Max 5MB)
            </label>

            {/* Current Image Display */}
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={imagePreview || currentDisplayImage}
                alt="Banner preview"
                style={{
                  height: "90px",
                  width: "160px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #3b82f6",
                }}
              />
              <span style={{ fontSize: "12px", color: imagePreview ? "#38bdf8" : "#94a3b8" }}>
                {imagePreview ? "New replacement selected" : "Current banner image"}
              </span>
            </div>

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
          </div>

          <div className="modal-field">
            <label>Announcement Details &amp; Description</label>
            <textarea
              rows={4}
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
                  <Loader2 size={16} className="spin" style={{ marginRight: 6 }} /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
