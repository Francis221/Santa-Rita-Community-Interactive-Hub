import React, { useState } from "react";
import { DB } from "../../services/db";
import { Trash2 } from "lucide-react";

export default function DeleteReportModal({ reports, onClose, onReportDeleted }) {
  const [selectedId, setSelectedId] = useState(reports[0]?.id || "");
  const selectedReport = reports.find((r) => r.id === selectedId);

  const handleDelete = (e) => {
    e.preventDefault();
    if (!selectedId) {
      alert("Please select a report to delete.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete report "${selectedReport?.title || 'selected report'}"? This cannot be undone.`)) {
      DB.deleteReport(selectedId);
      if (onReportDeleted) onReportDeleted();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chub-modal" onClick={(e) => e.stopPropagation()}>
        <button className="chub-modal__close" onClick={onClose}>✕</button>
        <h2 className="chub-modal__title" style={{ color: "#f87171" }}>DELETE REPORT</h2>

        {reports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8" }}>
            <p>No reports currently available to delete.</p>
            <button
              type="button"
              className="modal-submit-btn"
              style={{ background: "#334155", color: "#fff", marginTop: "1rem" }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleDelete}>
            <div className="modal-form-group">
              <label className="modal-label">SELECT REPORT TO DELETE</label>
              <select
                className="modal-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                required
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} — {r.parties} ({r.status})
                  </option>
                ))}
              </select>
            </div>

            {selectedReport && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "10px",
                  padding: "14px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#e2e8f0",
                }}
              >
                <div style={{ fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>
                  {selectedReport.title}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "12px", marginBottom: 2 }}>
                  Parties: {selectedReport.parties}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "12px", marginBottom: 2 }}>
                  Filed: {selectedReport.dateFiled} | Status: {selectedReport.status}
                </div>
                {selectedReport.details && (
                  <div style={{ color: "#cbd5e1", marginTop: 6, fontSize: "12px" }}>
                    Details: {selectedReport.details}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="modal-submit-btn modal-submit-btn--red"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Trash2 size={18} /> Delete Report Permanently
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
