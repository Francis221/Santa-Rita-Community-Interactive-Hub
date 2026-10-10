import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DB } from "../../services/db";

export default function RequestDocsModal({ onClose, onRequestUpdated }) {
  const navigate = useNavigate();
  const [docRequests, setDocRequests] = useState(DB.getDocumentRequests());

  const handleApprove = (id) => {
    const updated = DB.updateDocumentStatus(id, "Approved");
    setDocRequests(updated);
    if (onRequestUpdated) onRequestUpdated();
  };

  const handleReject = (id) => {
    const updated = DB.updateDocumentStatus(id, "Rejected");
    setDocRequests(updated);
    if (onRequestUpdated) onRequestUpdated();
  };

  const handleGoToRequestDocsPage = () => {
    onClose();
    navigate("/request-document");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chub-modal" onClick={(e) => e.stopPropagation()}>
        <button className="chub-modal__close" onClick={onClose}>✕</button>
        <h2 className="chub-modal__title">REQUEST DOCUMENTS</h2>

        <div className="req-docs-list-wrapper">
          {docRequests.slice(0, 8).map((req) => (
            <div className="req-doc-item" key={req.id}>
              <div className="req-doc-user-info">
                <div className="req-doc-icon-box" />
                <div>
                  <p className="req-doc-name">{req.applicantName}</p>
                  <p className="req-doc-type">{req.docType}</p>
                </div>
              </div>
              <div className="req-doc-actions">
                <button
                  className="btn-icon-check"
                  title="Approve Request"
                  onClick={() => handleApprove(req.id)}
                >
                  ✓
                </button>
                <button
                  className="btn-icon-close"
                  title="Reject Request"
                  onClick={() => handleReject(req.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="modal-submit-btn modal-submit-btn--purple"
          onClick={handleGoToRequestDocsPage}
          style={{ marginTop: 18 }}
        >
          SHOW MORE
        </button>
      </div>
    </div>
  );
}
