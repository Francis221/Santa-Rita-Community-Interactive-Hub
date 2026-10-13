import React, { useState } from "react";
import { X, Upload, User, Shield, AlertTriangle } from "lucide-react";

export default function OfficialModal({ official, onClose, onSaved }) {
  const isEditing = Boolean(official && official.id);

  const [name, setName] = useState(official?.name || "");
  const [position, setPosition] = useState(official?.position || "Barangay Kagawad");
  const [rankOrder, setRankOrder] = useState(official?.rank_order || 2);
  const [committee, setCommittee] = useState(official?.committee || "");
  const [termStart, setTermStart] = useState(official?.term_start || "2023");
  const [termEnd, setTermEnd] = useState(official?.term_end || "2026");
  const [phone, setPhone] = useState(official?.phone || "");
  const [email, setEmail] = useState(official?.email || "");
  const [isActive, setIsActive] = useState(official ? Boolean(official.is_active) : true);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(official?.photo || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePositionChange = (e) => {
    const pos = e.target.value;
    setPosition(pos);
    if (pos.includes("Punong Barangay") || pos.includes("Captain")) {
      setRankOrder(1);
    } else if (pos.includes("Kagawad")) {
      setRankOrder(2);
    } else if (pos.includes("SK Chair")) {
      setRankOrder(9);
    } else if (pos.includes("Secretary")) {
      setRankOrder(10);
    } else if (pos.includes("Treasurer")) {
      setRankOrder(11);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Photo file exceeds 5MB limit.");
        return;
      }
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(file.type)) {
        setError("Invalid file format. Only JPG, PNG, WEBP, or GIF are allowed.");
        return;
      }
      setError("");
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please provide the official's full name.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (isEditing) {
        formData.append("id", official.id);
      }
      formData.append("name", name.trim());
      formData.append("position", position.trim());
      formData.append("rank_order", String(rankOrder));
      formData.append("committee", committee.trim());
      formData.append("term_start", termStart.trim());
      formData.append("term_end", termEnd.trim());
      formData.append("phone", phone.trim());
      formData.append("email", email.trim());
      formData.append("is_active", isActive ? "1" : "0");

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const action = isEditing ? "update" : "create";
      const res = await fetch(`/api/officials.php?action=${action}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to save official.");
        setLoading(false);
        return;
      }

      alert(isEditing ? "Official details updated successfully!" : "New official added successfully!");
      if (onSaved) onSaved(data.official);
      onClose();
    } catch (err) {
      setError("Network error while saving official.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="chub-modal"
        style={{ maxWidth: "560px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="chub-modal__close" onClick={onClose} title="Close modal">
          ✕
        </button>

        <h2 className="chub-modal__title">
          {isEditing ? "EDIT BARANGAY OFFICIAL" : "ADD BARANGAY OFFICIAL"}
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "-6px", marginBottom: "16px" }}>
          Maintain the council hierarchy, committee assignments, and official credentials.
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
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Photo Preview & File Upload */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#e2e8f0",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #38bdf8",
                flexShrink: 0,
              }}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Official preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <User size={30} color="#94a3b8" />
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
                OFFICIAL PORTRAIT PHOTO (JPG, PNG, WEBP - MAX 5MB)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                style={{ fontSize: "12px" }}
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-label">FULL NAME *</label>
            <input
              type="text"
              className="modal-input"
              placeholder="e.g. HON. JUAN C. DELA CRUZ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-label">POSITION / TITLE *</label>
              <select
                className="modal-select"
                value={position}
                onChange={handlePositionChange}
                required
              >
                <option value="Punong Barangay (Barangay Captain)">Punong Barangay (Barangay Captain)</option>
                <option value="Barangay Kagawad">Barangay Kagawad</option>
                <option value="SK Chairperson">SK Chairperson</option>
                <option value="Barangay Secretary">Barangay Secretary</option>
                <option value="Barangay Treasurer">Barangay Treasurer</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label className="modal-label">RANK ORDER (1 = HIGHEST)</label>
              <input
                type="number"
                min="1"
                max="99"
                className="modal-input"
                value={rankOrder}
                onChange={(e) => setRankOrder(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-label">COMMITTEE / SPECIALTY (OPTIONAL)</label>
            <input
              type="text"
              className="modal-input"
              placeholder="e.g. Committee on Health, Peace & Order, Education"
              value={committee}
              onChange={(e) => setCommittee(e.target.value)}
            />
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-label">TERM START</label>
              <input
                type="text"
                className="modal-input"
                placeholder="2023"
                value={termStart}
                onChange={(e) => setTermStart(e.target.value)}
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-label">TERM END</label>
              <input
                type="text"
                className="modal-input"
                placeholder="2026"
                value={termEnd}
                onChange={(e) => setTermEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-label">OFFICE CONTACT PHONE</label>
              <input
                type="text"
                className="modal-input"
                placeholder="0912 345 6789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-label">EMAIL ADDRESS</label>
              <input
                type="email"
                className="modal-input"
                placeholder="official@sta-rita.gov.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <label htmlFor="isActiveCheck" style={{ fontSize: "13px", fontWeight: 500, color: "#1e293b", cursor: "pointer" }}>
              Active in Barangay Council
            </label>
          </div>

          <button
            type="submit"
            className="modal-submit-btn modal-submit-btn--green"
            style={{ width: "100%", padding: "12px", background: "#0284c7", cursor: loading ? "not-allowed" : "pointer" }}
            disabled={loading}
          >
            {loading ? "Saving Official..." : isEditing ? "Save Official Changes" : "Add to Council"}
          </button>
        </form>
      </div>
    </div>
  );
}
