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

  // Form submission handler to save the new report
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.caseType || !formData.complainant) {
      alert("Please fill in Case Type and Complainant name.");
      return;
    }
    await DB.addReport(formData);
    if (onReportAdded) onReportAdded();
    if (onClose) onClose();
  };

  return (
    /* Modal Backdrop Overlay */
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal Dialog Card */}
      <div className="chub-modal" onClick={(e) => e.stopPropagation()}>
        {/* Button to close the modal */}
        <button className="chub-modal__close" onClick={onClose} aria-label="Close Modal" title="Close modal">✕</button>
        <h2 className="chub-modal__title">ADD REPORT</h2>

        {/* Report submission form */}
        <form onSubmit={handleSubmit}>
          {/* Case Type Input Field */}
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
            {/* Complainant Name Input Field */}
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
            {/* Respondent Name Input Field */}
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
            {/* Date Filed Input Field */}
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
            {/* Initial Case Status Selector */}
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

          {/* Incident Details Textarea */}
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

          {/* Button to submit and publish the report */}
          <button style={{ cursor: "pointer", backgroundColor: "#f97316" }} type="submit" className="modal-submit-btn modal-submit-btn--green">
            Add Report
          </button>
        </form>
      </div>
    </div>
  );
}
