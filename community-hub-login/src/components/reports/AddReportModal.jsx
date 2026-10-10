import React, { useState } from "react";
import { DB } from "../../services/db";

export default function AddReportModal({ onClose, onReportAdded }) {
  const [formData, setFormData] = useState({
    caseType: "",
    complainant: "",
    respondent: "",
    dateFiled: new Date().toISOString().split("T")[0],
    purok: "Purok 1",
    status: "Pending",
    details: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.caseType || !formData.complainant) {
      alert("Please fill in Case Type and Complainant name.");
      return;
    }
    DB.addReport(formData);
    onReportAdded();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chub-modal" onClick={(e) => e.stopPropagation()}>
        <button className="chub-modal__close" onClick={onClose}>✕</button>
        <h2 className="chub-modal__title">ADD REPORT</h2>

        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label className="modal-label">CASE TYPE</label>
            <input
              type="text"
              name="caseType"
              className="modal-input"
              placeholder="e.g. Noise Complaint, Fence Dispute, Illegal Parking"
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
                placeholder="Complainant Name"
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
                placeholder="Respondent Name"
                value={formData.respondent}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-label">DATE FILED</label>
              <input
                type="date"
                name="dateFiled"
                className="modal-input"
                value={formData.dateFiled}
                onChange={handleChange}
              />
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
          </div>

          <div className="modal-form-group">
            <label className="modal-label">DETAILS</label>
            <textarea
              name="details"
              className="modal-textarea"
              placeholder="Enter detailed description of the incident..."
              value={formData.details}
              onChange={handleChange}
            ></textarea>
          </div>

          <button style={{ cursor: "pointer", backgroundColor: "orange" }} type="submit" className="modal-submit-btn modal-submit-btn--green">
            Add Report
          </button>
        </form>
      </div>
    </div>
  );
}
