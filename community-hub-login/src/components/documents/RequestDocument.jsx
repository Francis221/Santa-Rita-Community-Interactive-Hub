import React, { useState, useEffect } from "react";
import { DB } from "../../services/db";
import { useAuth } from "../../context/AuthContext";
import ResidencyTemplate from "./ResidencyTemplate";
import IndigencyTemplate from "./IndigencyTemplate";
import ClearanceTemplate from "./ClearanceTemplate";
import GoodMoralTemplate from "./GoodMoralTemplate";
import { Check, X, RefreshCw, Printer } from "lucide-react";
import "./Documents.css";

const DOC_TYPES = [
  { id: "BARANGAY RESIDENCY", label: "Barangay Residency", icon: "📄" },
  { id: "BARANGAY INDIGENCY", label: "Certificate of Indigency", icon: "📜" },
  { id: "BARANGAY CLEARANCE", label: "Barangay Clearance", icon: "🛡️" },
  { id: "GOOD MORAL", label: "Good Moral", icon: "⭐" },
];

export default function RequestDocument() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [activeDocType, setActiveDocType] = useState("BARANGAY CLEARANCE");
  const [docRequests, setDocRequests] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState("");
  
  // Live auto-fill form state
  const [formData, setFormData] = useState({
    applicantName: user?.username ? user.username.toUpperCase() : "FRANCIS REGIE DE GUZMAN",
    civilStatus: "Single",
    age: 25,
    address: "Purok 3, Sta. Rita Central, Agoo, La Union",
    purpose: "Employment Requirement",
    dateIssued: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    ctcNo: "CTC-2026-8841",
    orNo: "OR-99120",
  });

  const refreshRequests = () => {
    setDocRequests(DB.getDocumentRequests());
  };

  useEffect(() => {
    refreshRequests();
    const handleUpdate = () => refreshRequests();
    window.addEventListener("docRequestsUpdated", handleUpdate);
    return () => window.removeEventListener("docRequestsUpdated", handleUpdate);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePresetSelect = (name) => {
    setFormData((prev) => ({
      ...prev,
      applicantName: name.toUpperCase(),
    }));
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    const docName = DOC_TYPES.find((d) => d.id === activeDocType)?.label || activeDocType;
    DB.addDocumentRequest({
      applicantName: formData.applicantName,
      docType: activeDocType,
      documentName: docName,
      address: formData.address,
      civilStatus: formData.civilStatus,
      age: formData.age,
      purpose: formData.purpose,
      ctcNo: formData.ctcNo,
      orNo: formData.orNo,
      status: "Pending",
    });
    refreshRequests();
    setSubmitSuccess(`Your document request for ${docName} has been submitted successfully!`);
    setTimeout(() => setSubmitSuccess(""), 4000);
  };

  const handleAccept = (id) => {
    DB.updateDocumentStatus(id, "Approved");
    refreshRequests();
  };

  const handleDecline = (id) => {
    DB.updateDocumentStatus(id, "Declined");
    refreshRequests();
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePreviewRequest = (req) => {
    setActiveDocType(req.docType);
    setFormData((prev) => ({
      ...prev,
      applicantName: req.applicantName || prev.applicantName,
      address: req.address || prev.address,
      civilStatus: req.civilStatus || prev.civilStatus,
      age: req.age || prev.age,
      purpose: req.purpose || prev.purpose,
      ctcNo: req.ctcNo || prev.ctcNo,
      orNo: req.orNo || prev.orNo,
    }));
  };

  const renderTemplatePreview = () => {
    switch (activeDocType) {
      case "BARANGAY RESIDENCY":
        return <ResidencyTemplate data={formData} />;
      case "BARANGAY INDIGENCY":
        return <IndigencyTemplate data={formData} />;
      case "GOOD MORAL":
        return <GoodMoralTemplate data={formData} />;
      case "BARANGAY CLEARANCE":
      default:
        return <ClearanceTemplate data={formData} />;
    }
  };

  return (
    <div className="page docs-page">
      {/* Header */}
      <div className="docs-header">
        <h1>{isAdmin ? "Document Requests & Certificate Issuance" : "Request Barangay Document"}</h1>
        <p>
          {isAdmin
            ? "Review and manage resident document requests, accept or decline submissions, and print official certificates."
            : "Select a document type, fill out the required details, and click 'Request Documents' to submit your application."}
        </p>
      </div>

      {submitSuccess && (
        <div style={{
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          border: "1px solid #10b981",
          color: "#34d399",
          padding: "12px 18px",
          borderRadius: "10px",
          marginBottom: "20px",
          fontSize: "14px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <Check size={18} /> {submitSuccess}
        </div>
      )}

      {/* Document Selector Tabs */}
      <div className="docs-type-tabs">
        {DOC_TYPES.map((doc) => (
          <button
            key={doc.id}
            className={`doc-tab-btn ${activeDocType === doc.id ? "doc-tab-btn--active" : ""}`}
            onClick={() => setActiveDocType(doc.id)}
          >
            <span>{doc.icon}</span>
            <span>{doc.label}</span>
          </button>
        ))}
      </div>

      {/* Form Workspace Grid */}
      <div className="docs-workspace-grid">
        {/* Editor Form */}
        <div className="docs-editor-card">
          <div className="editor-section-title">
            <span>{isAdmin ? "ADMIN DOCUMENT GENERATOR" : "REQUEST FORM DETAILS"}</span>
            <span className="autofill-hint">⚡ LIVE PREVIEW ACTIVE</span>
          </div>

          <form onSubmit={handleSubmitRequest}>
            <div className="doc-form-group">
              <label>FULL NAME (APPLICANT)</label>
              <input
                type="text"
                name="applicantName"
                className="doc-input"
                placeholder="Type applicant full name..."
                value={formData.applicantName}
                onChange={handleChange}
                required
              />
              {!isAdmin && (
                <div className="doc-presets">
                  <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center' }}>Quick Fill:</span>
                  <button
                    type="button"
                    className="preset-chip"
                    onClick={() => handlePresetSelect(user?.username || "JUAN DELA CRUZ")}
                  >
                    {user?.username || "JUAN DELA CRUZ"}
                  </button>
                </div>
              )}
            </div>

            <div className="modal-form-row">
              <div className="doc-form-group">
                <label>CIVIL STATUS</label>
                <select
                  name="civilStatus"
                  className="doc-select"
                  value={formData.civilStatus}
                  onChange={handleChange}
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>

              <div className="doc-form-group">
                <label>AGE</label>
                <input
                  type="number"
                  name="age"
                  className="doc-input"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="doc-form-group">
              <label>COMPLETE ADDRESS / PUROK</label>
              <input
                type="text"
                name="address"
                className="doc-input"
                placeholder="e.g. Purok 3, Sta. Rita Central, Agoo, La Union"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="doc-form-group">
              <label>PURPOSE OF REQUEST</label>
              <input
                type="text"
                name="purpose"
                className="doc-input"
                placeholder="e.g. Employment, Scholarship, Financial Assistance"
                value={formData.purpose}
                onChange={handleChange}
                required
              />
            </div>

            {isAdmin && (
              <div className="modal-form-row">
                <div className="doc-form-group">
                  <label>CTC NUMBER</label>
                  <input
                    type="text"
                    name="ctcNo"
                    className="doc-input"
                    value={formData.ctcNo}
                    onChange={handleChange}
                  />
                </div>

                <div className="doc-form-group">
                  <label>O.R. NUMBER</label>
                  <input
                    type="text"
                    name="orNo"
                    className="doc-input"
                    value={formData.orNo}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="editor-actions">
              {!isAdmin ? (
                /* RESIDENTS: Exactly 1 button with text 'Request Documents' */
                <button type="submit" className="btn-doc-primary btn-doc-single" style={{ width: '100%', fontSize: '15px' }}>
                  Request Documents
                </button>
              ) : (
                /* ADMIN: Save & Print buttons */
                <>
                  <button type="submit" className="btn-doc-primary">
                    💾 Save Request
                  </button>
                  <button type="button" className="btn-doc-print" onClick={handlePrint}>
                    <Printer size={16} /> Print / Download
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Live Printable Preview Template */}
        <div>
          <div style={{ marginBottom: 10, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase' }}>
            OFFICIAL CERTIFICATE PREVIEW
          </div>
          {renderTemplatePreview()}
        </div>
      </div>

      {/* Document Requests Records Table */}
      <div className="doc-requests-table-card">
        <div className="records-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="records-card__title" style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
            {isAdmin ? "Resident Document Requests Database" : "My Document Request Status"}
          </h2>
          <button
            className="records-card__view-all"
            onClick={refreshRequests}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
          >
            <RefreshCw size={14} /> Refresh List
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="records-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>APPLICANT NAME</th>
                <th>DOCUMENT TYPE</th>
                <th>PURPOSE</th>
                <th>STATUS</th>
                <th>DATE REQUESTED</th>
                {isAdmin && <th>ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {docRequests.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: "center", color: "#94a3b8", padding: "24px" }}>
                    No document requests recorded yet.
                  </td>
                </tr>
              ) : (
                docRequests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: "bold" }}>{req.id}</td>
                    <td style={{ color: "#fff", fontWeight: "bold" }}>{req.applicantName}</td>
                    <td>
                      <span style={{ textTransform: "uppercase", fontWeight: 600, color: "#60a5fa" }}>
                        {req.docType}
                      </span>
                    </td>
                    <td>{req.purpose}</td>
                    <td>
                      <span
                        className={`badge-status badge-status--${
                          req.status === "Approved" || req.status === "Accepted"
                            ? "settled"
                            : req.status === "Pending"
                            ? "pending"
                            : "unsettled"
                        }`}
                      >
                        {req.status === "Approved" ? "Approved" : req.status === "Declined" ? "Declined" : "Pending"}
                      </span>
                    </td>
                    <td>{req.dateRequested}</td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button
                            type="button"
                            className="btn-doc-accept"
                            onClick={() => handleAccept(req.id)}
                            title="Accept Request"
                          >
                            <Check size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                            Accept
                          </button>
                          <button
                            type="button"
                            className="btn-doc-decline"
                            onClick={() => handleDecline(req.id)}
                            title="Decline Request"
                          >
                            <X size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePreviewRequest(req)}
                            style={{
                              background: "rgba(59, 130, 246, 0.2)",
                              border: "1px solid rgba(59, 130, 246, 0.4)",
                              color: "#60a5fa",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontWeight: 600
                            }}
                            title="Preview Certificate"
                          >
                            Preview
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
