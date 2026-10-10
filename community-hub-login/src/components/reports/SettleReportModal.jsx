import React, { useState } from "react";
import { DB } from "../../services/db";

export default function SettleReportModal({ reports, onClose, onReportSettled }) {
  const pendingReports = reports.filter((r) => r.status === "Pending");
  const [selectedId, setSelectedId] = useState(pendingReports[0]?.id || "");
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split("T")[0]);
  const [settleBy, setSettleBy] = useState("Hon. Juan De La Cruz");
  const [resolutionSummary, setResolutionSummary] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedId) {
      alert("Please select a pending case to settle.");
      return;
    }
    DB.settleReport(selectedId, {
      settlementDate,
      settleBy,
      resolutionSummary,
    });
    onReportSettled();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chub-modal" onClick={(e) => e.stopPropagation()}>
        <button className="chub-modal__close" onClick={onClose}>✕</button>
        <h2 className="chub-modal__title">SETTLE CASE</h2>

        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label className="modal-label">SELECT PENDING CASE</label>
            <select
              className="modal-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
            >
              {pendingReports.length === 0 ? (
                <option value="">No pending cases available</option>
              ) : (
                pendingReports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.parties})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-label">SETTLEMENT DATE</label>
              <input
                type="date"
                className="modal-input"
                value={settlementDate}
                onChange={(e) => setSettlementDate(e.target.value)}
                required
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-label">SETTLE BY</label>
              <select
                className="modal-select"
                value={settleBy}
                onChange={(e) => setSettleBy(e.target.value)}
              >
                <option value="Hon. Juan De La Cruz">Hon. Juan De La Cruz (Captain)</option>
                <option value="Hon. Maria Santos">Hon. Maria Santos (Secretary)</option>
                <option value="Hon. Roberto Garcia">Hon. Roberto Garcia (Kagawad)</option>
                <option value="Hon. Elena Reyes">Hon. Elena Reyes (Lupon)</option>
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-label">RESOLUTION SUMMARY</label>
            <textarea
              className="modal-textarea"
              placeholder="Enter agreement terms and resolution details..."
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              required
            ></textarea>
          </div>

          <button type="submit" className="modal-submit-btn modal-submit-btn--purple">
            Settle Report
          </button>
        </form>
      </div>
    </div>
  );
}
