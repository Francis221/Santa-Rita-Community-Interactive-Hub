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
    /* Modal Backdrop Overlay */
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal Dialog Card */}
      <div className="chub-modal" onClick={(e) => e.stopPropagation()}>
        {/* Button to close Request Documents modal */}
        <button className="chub-modal__close" onClick={onClose} aria-label="Close modal" title="Close modal">✕</button>
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
                {/* Button to approve document request */}
                <button
                  className="btn-icon-check"
                  title="Approve Request"
                  aria-label="Approve request"
                  onClick={() => handleApprove(req.id)}
                >
                  ✓
                </button>
                {/* Button to reject document request */}
                <button
                  className="btn-icon-close"
                  title="Reject Request"
                  aria-label="Reject request"
                  onClick={() => handleReject(req.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Button to navigate to the full Document Requests workspace */}
        <button
          type="button"
          className="modal-submit-btn modal-submit-btn--purple"
          onClick={handleGoToRequestDocsPage}
          style={{ marginTop: 18 }}
          title="Open full document issuance workspace"
        >
          SHOW MORE
        </button>
      </div>
    </div>
  );
}
