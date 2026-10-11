import React, { useState, useEffect } from "react";
import { DB } from "../../services/db";

export default function EditReportModal({ reports, onClose, onReportUpdated }) {
  const [selectedId, setSelectedId] = useState(reports[0]?.id || "");
  const [formData, setFormData] = useState({
    caseType: "",
    complainant: "",
    respondent: "",
    dateFiled: "",
    purok: "Purok 1",
    status: "Pending",
    description: "",
  });

  useEffect(() => {
    if (selectedId) {
      const rep = reports.find((r) => r.id === selectedId);
      if (rep) {
        setFormData({
          caseType: rep.caseType || rep.title || "",
          complainant: rep.complainant || "",
          respondent: rep.respondent || "",
          dateFiled: rep.dateFiled || "",
          purok: rep.purok || "Purok 1",
          status: rep.status || "Pending",
          description: rep.description || "",
        });
      }
    }
  }, [selectedId, reports]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedId) return;
    DB.updateReport(selectedId, formData);
    onReportUpdated();
    onClose();
  };

  return (
    /* Modal Backdrop Overlay */
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal Dialog Card */}
      <div className="chub-modal" onClick={(e) => e.stopPropagation()}>
        {/* Button to close edit modal */}
        <button className="chub-modal__close" onClick={onClose} aria-label="Close Modal" title="Close modal">✕</button>
        <h2 className="chub-modal__title">EDIT REPORT</h2>

        {/* Report editing form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label className="modal-label">SELECT REPORT</label>
            <select
              className="modal-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.title} ({r.parties})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-label">CASE TYPE</label>
            <input
              type="text"
              name="caseType"
              className="modal-input"
              value={formData.caseType}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-label">COMPLAINANT</label>
              <input
                type="text"
                name="complainant"
                className="modal-input"
                value={formData.complainant}
                onChange={handleChange}
                required
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-label">RESPONDENT</label>
              <input
                type="text"
                name="respondent"
                className="modal-input"
                value={formData.respondent}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-label">DATE FILED</label>
              <input
                type="text"
                name="dateFiled"
                className="modal-input"
                value={formData.dateFiled}
                onChange={handleChange}
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-label">PUROK</label>
              <input
                type="text"
                name="purok"
                className="modal-input"
                value={formData.purok}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-label">STATUS</label>
            <select
              name="status"
              className="modal-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="Settled">Settled</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Unsettled">Unsettled</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-label">DESCRIPTION</label>
            <textarea
              name="description"
              className="modal-textarea"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Button to save modified report changes */}
          <button type="submit" className="modal-submit-btn modal-submit-btn--red" title="Save updated report">
            Edit Report
          </button>
        </form>
      </div>
    </div>
  );
}
