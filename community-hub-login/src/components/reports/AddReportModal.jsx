import React, { useState, useEffect } from "react";
import { DB } from "../../services/db";
import { useAuth } from "../../context/AuthContext";
import { Shield, User, Phone, MapPin, Hash, Lock, Search } from "lucide-react";

export default function AddReportModal({ onClose, onReportAdded }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [residents, setResidents] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [residentSearch, setResidentSearch] = useState("");

  // Determine current complainant details
  const myResidentId = user?.resident_id || ("RES-" + String(user?.id || 2).padStart(4, "0"));
  const myName = user?.full_name || user?.username || "Resident";
  const myContact = user?.contact_number || user?.phone || "0912 345 6789";
  const myAddress = user?.address || user?.purok || "Purok 1, Sta. Rita Central";

  const [complainantInfo, setComplainantInfo] = useState({
    id: user?.id || 2,
    residentId: myResidentId,
    name: myName,
    contact: myContact,
    address: myAddress,
  });

  const [formData, setFormData] = useState({
    caseType: "",
    respondent: "",
    dateFiled: new Date().toISOString().split("T")[0],
    purok: "Purok 1",
    details: "",
  });

  // Admin: Fetch list of registered residents for searchable selection
  useEffect(() => {
    if (isAdmin) {
      fetch("/api/users.php", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && Array.isArray(data.users)) {
            const list = data.users.filter((u) => u.role !== "Admin" || u.id === user?.id);
            setResidents(list);
          }
        })
        .catch(() => {
          // Fallback to local residents list
          const localRes = DB.getResidents();
          setResidents(localRes);
        });
    }
  }, [isAdmin, user?.id]);

  // When admin selects a resident from dropdown
  const handleResidentSelect = (residentIdStr) => {
    setSelectedResidentId(residentIdStr);
    const target = residents.find(
      (r) => String(r.id) === String(residentIdStr) || r.id === residentIdStr
    );
    if (target) {
      const rawNum = String(target.id).replace(/\D/g, "") || "1";
      setComplainantInfo({
        id: target.id,
        residentId: target.resident_id || `RES-${String(rawNum).padStart(4, "0")}`,
        name: target.full_name || target.name || target.username,
        contact: target.contact_number || target.phone || "0912 345 6789",
        address: target.address || target.purok || "Sta. Rita Central, Agoo",
      });
    } else {
      setComplainantInfo({
        id: user?.id || 2,
        residentId: myResidentId,
        name: myName,
        contact: myContact,
        address: myAddress,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.caseType.trim()) {
      alert("Please provide the Case Type / Nature of Incident.");
      return;
    }

    const payload = {
      ...formData,
      complainant_user_id: isAdmin && selectedResidentId ? complainantInfo.id : user?.id,
      complainant: complainantInfo.name,
      contact_number: complainantInfo.contact,
      address: complainantInfo.address,
      resident_id: complainantInfo.residentId,
      status: "Pending",
    };

    await DB.addReport(payload);
    if (onReportAdded) onReportAdded();
    alert("Incident report has been submitted successfully! Admins have been notified.");
    if (onClose) onClose();
  };

  const filteredResidents = residents.filter((r) => {
    const name = (r.full_name || r.name || r.username || "").toLowerCase();
    return name.includes(residentSearch.toLowerCase());
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="chub-modal"
        style={{ maxWidth: "580px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="chub-modal__close"
          onClick={onClose}
          aria-label="Close Modal"
          title="Close modal"
        >
          ✕
        </button>
        <h2 className="chub-modal__title">FILE INCIDENT REPORT</h2>
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "-6px", marginBottom: "16px" }}>
          Community complaints are officially recorded and routed to Barangay Lupon / Council.
        </p>

        {/* Section 8: Searchable Resident Dropdown FOR ADMIN ONLY */}
        {isAdmin && (
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#1e293b",
                marginBottom: "6px",
              }}
            >
              <Search size={14} color="#0284c7" />
              ADMIN: FILE ON BEHALF OF RESIDENT (OPTIONAL)
            </label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
              <input
                type="text"
                placeholder="Filter resident list..."
                className="modal-input"
                style={{ padding: "6px 10px", fontSize: "13px" }}
                value={residentSearch}
                onChange={(e) => setResidentSearch(e.target.value)}
              />
            </div>
            <select
              className="modal-select"
              style={{ padding: "8px 10px", fontSize: "13px" }}
              value={selectedResidentId}
              onChange={(e) => handleResidentSelect(e.target.value)}
            >
              <option value="">-- Myself (Barangay Officer / Admin) --</option>
              {filteredResidents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.full_name || r.name || r.username} ({r.role || "Resident"} - {r.purok || "Sta. Rita"})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Section 8: Complainant is automatic & read-only info card */}
        <div
          style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)",
            border: "1px solid #bae6fd",
            borderRadius: "10px",
            padding: "14px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                color: "#0369a1",
                textTransform: "uppercase",
              }}
            >
              Complainant Information
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color: "#047857",
                background: "#d1fae5",
                padding: "2px 8px",
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              <Lock size={11} /> Auto-filled from account
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              fontSize: "13px",
            }}
          >
            <div>
              <div style={{ color: "#64748b", fontSize: "11px", display: "flex", alignItems: "center", gap: 4 }}>
                <User size={12} /> Complainant Name
              </div>
              <div style={{ fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                {complainantInfo.name}
              </div>
            </div>

            <div>
              <div style={{ color: "#64748b", fontSize: "11px", display: "flex", alignItems: "center", gap: 4 }}>
                <Hash size={12} /> Resident ID
              </div>
              <div style={{ fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                {complainantInfo.residentId}
              </div>
            </div>

            <div>
              <div style={{ color: "#64748b", fontSize: "11px", display: "flex", alignItems: "center", gap: 4 }}>
                <Phone size={12} /> Contact Number
              </div>
              <div style={{ fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                {complainantInfo.contact}
              </div>
            </div>

            <div>
              <div style={{ color: "#64748b", fontSize: "11px", display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={12} /> Address / Purok
              </div>
              <div style={{ fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                {complainantInfo.address}
              </div>
            </div>
          </div>
        </div>

        {/* Incident Form Details */}
        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label className="modal-label">CASE TYPE / INCIDENT NATURE *</label>
            <input
              type="text"
              name="caseType"
              className="modal-input"
              placeholder="e.g. Noise Complaint, Boundary Dispute, Illegal Parking, Public Disturbance"
              value={formData.caseType}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-label">RESPONDENT (PERSON / ENTITY INVOLVED)</label>
              <input
                type="text"
                name="respondent"
                className="modal-input"
                placeholder="Name of respondent or N/A"
                value={formData.respondent}
                onChange={handleChange}
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-label">INCIDENT PUROK / LOCATION</label>
              <select
                name="purok"
                className="modal-select"
                value={formData.purok}
                onChange={handleChange}
              >
                <option value="Purok 1">Purok 1</option>
                <option value="Purok 2">Purok 2</option>
                <option value="Purok 3">Purok 3</option>
                <option value="Purok 4">Purok 4</option>
                <option value="Purok 5">Purok 5</option>
                <option value="Purok 6">Purok 6</option>
                <option value="Barangay Plaza">Barangay Plaza / Commercial</option>
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-label">DATE OF INCIDENT</label>
            <input
              type="date"
              name="dateFiled"
              className="modal-input"
              value={formData.dateFiled}
              onChange={handleChange}
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-label">INCIDENT DETAILS & NARRATIVE *</label>
            <textarea
              name="details"
              className="modal-textarea"
              rows={4}
              placeholder="Describe what occurred, time of incident, landmarks, and relevant context..."
              value={formData.details}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="modal-submit-btn modal-submit-btn--green"
            style={{ cursor: "pointer", background: "#16a34a", width: "100%", padding: "12px", fontWeight: 600 }}
          >
            Submit Incident Report
          </button>
        </form>
      </div>
    </div>
  );
}
