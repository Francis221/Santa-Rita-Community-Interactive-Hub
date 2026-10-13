import React, { useState, useEffect } from "react";
import { DB } from "../../services/db";
import { useAuth } from "../../context/AuthContext";
import ResidencyTemplate from "./ResidencyTemplate";
import IndigencyTemplate from "./IndigencyTemplate";
import ClearanceTemplate from "./ClearanceTemplate";
import GoodMoralTemplate from "./GoodMoralTemplate";
import { Check, X, RefreshCw, Printer, Download, FileText } from "lucide-react";
import "./Documents.css";

const DOC_TYPES = [
  { id: "BARANGAY RESIDENCY", label: "Barangay Residency", icon: "📄" },
  { id: "BARANGAY INDIGENCY", label: "Certificate of Indigency", icon: "📜" },
  { id: "BARANGAY CLEARANCE", label: "Barangay Clearance", icon: "🛡️" },
  { id: "GOOD MORAL", label: "Good Moral", icon: "⭐" },
];

/**
 * RequestDocument Component
 * Handles resident document submissions, admin approval workflows,
 * live certificate previewing, and automated approved letter downloading.
 */
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
    DB.fetchDocumentRequestsFromApi().then((data) => {
      if (data) setDocRequests(data);
    });

    const handleUpdate = () => refreshRequests();
    window.addEventListener("docRequestsUpdated", handleUpdate);
    return () => window.removeEventListener("docRequestsUpdated", handleUpdate);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Quick preset button click handler
  const handlePresetSelect = (name) => {
    setFormData((prev) => ({
      ...prev,
      applicantName: name.toUpperCase(),
    }));
  };

  // Form submission handler for new document requests
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    const docName = DOC_TYPES.find((d) => d.id === activeDocType)?.label || activeDocType;
    await DB.addDocumentRequest({
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

  // Admin action handler to accept and approve a request
  const handleAccept = (id) => {
    DB.updateDocumentStatus(id, "Approved");
    refreshRequests();
  };

  // Admin action handler to decline a request
  const handleDecline = (id) => {
    DB.updateDocumentStatus(id, "Declined");
    refreshRequests();
  };

  // Direct print certificate handler
  const handlePrint = () => {
    window.print();
  };

  // Preview certificate handler in the on-screen card
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

  /**
   * Automated Download Handler for Approved Letters/Certificates
   * When an approved request is clicked, this generates and downloads the official document file.
   */
  const handleDownloadApprovedDocument = (req) => {
    handlePreviewRequest(req);

    const safeDocType = req.docType || "BARANGAY CLEARANCE";
    const safeName = req.applicantName || "Resident";
    const dateIssued = req.dateRequested || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const ctc = req.ctcNo || "CTC-2026-8841";
    const orNum = req.orNo || "OR-99120";

    let bodyHtml = "";
    if (safeDocType.includes("RESIDENCY")) {
      bodyHtml = `
        <p>THIS IS TO CERTIFY that <span class="highlight">${safeName}</span>, of legal age, <span class="highlight">${req.civilStatus || 'Single'}</span>, Filipino citizen, is a bona fide resident of <span class="highlight">${req.address || 'Barangay Sta. Rita Central, Agoo, La Union'}</span>.</p>
        <p>BASED ON THE RECORDS OF THIS OFFICE, the above-named individual has been residing in Barangay Sta. Rita Central, Agoo, La Union, and is known to be of good moral character and a law-abiding citizen in the community.</p>
        <p>THIS CERTIFICATION is issued upon request of the interested party for <span class="highlight">${req.purpose || 'Proof of Residency / Legal Purposes'}</span>.</p>
      `;
    } else if (safeDocType.includes("INDIGENCY")) {
      bodyHtml = `
        <p>THIS IS TO CERTIFY that <span class="highlight">${safeName}</span>, of legal age, <span class="highlight">${req.civilStatus || 'Single'}</span>, Filipino citizen, residing at <span class="highlight">${req.address || 'Barangay Sta. Rita Central, Agoo, La Union'}</span>, belongs to the INDIGENT / LOW-INCOME FAMILIES of this Barangay.</p>
        <p>BASED ON THE VERIFICATION CONDUCTED, the family has insufficient family income to support basic emergency or institutional requirements.</p>
        <p>THIS CERTIFICATE OF INDIGENCY is issued upon request of the applicant for <span class="highlight">${req.purpose || 'Financial / Medical Assistance'}</span>.</p>
      `;
    } else if (safeDocType.includes("GOOD MORAL")) {
      bodyHtml = `
        <p>THIS IS TO CERTIFY that <span class="highlight">${safeName}</span>, of legal age, <span class="highlight">${req.civilStatus || 'Single'}</span>, Filipino citizen, residing at <span class="highlight">${req.address || 'Barangay Sta. Rita Central, Agoo, La Union'}</span>, is a resident of good moral standing and upright repute in our community.</p>
        <p>THE BEARER has continuously demonstrated civic participation and has not been convicted of any crime involving moral turpitude.</p>
        <p>THIS CERTIFICATE OF GOOD MORAL CHARACTER is issued for the purpose of <span class="highlight">${req.purpose || 'Scholarship / Employment Requirement'}</span>.</p>
      `;
    } else {
      // Default: Barangay Clearance
      bodyHtml = `
        <p>THIS IS TO CERTIFY that <span class="highlight">${safeName}</span>, of legal age, <span class="highlight">${req.civilStatus || 'Single'}</span>, Filipino citizen, residing at <span class="highlight">${req.address || 'Barangay Sta. Rita Central, Agoo, La Union'}</span>, is a person of good moral character and reputable standing in our community.</p>
        <p>ACCORDING TO THE RECORDS FILED IN THIS OFFICE, he/she has <span class="highlight">NO DEROGATORY RECORD</span> or pending criminal/civil complaint filed against him/her in this Barangay.</p>
        <p>THIS BARANGAY CLEARANCE is issued upon request of the above-named person for the purpose of <span class="highlight">${req.purpose || 'Employment / Local Record Clearance'}</span>.</p>
      `;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official ${safeDocType} - ${safeName}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: 'Times New Roman', Times, serif;
      color: #111827;
      background: #f1f5f9;
      margin: 0;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .action-banner {
      width: 100%;
      max-width: 800px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      color: #f8fafc;
      padding: 14px 24px;
      border-radius: 10px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
    }
    .print-button {
      background: #10b981;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    .print-button:hover {
      background: #059669;
    }
    .certificate-card {
      width: 100%;
      max-width: 800px;
      background: #ffffff;
      border: 3px double #1e3a8a;
      padding: 50px 60px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      box-sizing: border-box;
      position: relative;
    }
    .watermark-stamp {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-25deg);
      font-size: 48px;
      font-weight: 900;
      color: rgba(16, 185, 129, 0.08);
      border: 5px dashed rgba(16, 185, 129, 0.16);
      padding: 18px 36px;
      pointer-events: none;
      user-select: none;
      text-align: center;
      letter-spacing: 4px;
      border-radius: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .official-header {
      text-align: center;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 16px;
      margin-bottom: 28px;
      line-height: 1.4;
    }
    .official-header p { margin: 2px 0; font-size: 13.5px; }
    .official-header .republic { font-weight: bold; letter-spacing: 1px; font-size: 13px; }
    .official-header .barangay { font-size: 17px; font-weight: bold; color: #1e3a8a; }
    .official-header .office { font-weight: bold; font-size: 14.5px; margin-top: 6px; color: #334155; }
    .document-title {
      text-align: center;
      font-size: 26px;
      font-weight: bold;
      text-decoration: underline;
      color: #1e3a8a;
      margin: 30px 0;
      letter-spacing: 2px;
    }
    .salutation {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 20px;
    }
    .body-paragraphs p {
      font-size: 16px;
      line-height: 1.85;
      text-align: justify;
      text-indent: 40px;
      margin: 16px 0;
    }
    .highlight {
      font-weight: bold;
      text-decoration: underline;
    }
    .signatures-row {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .thumbprint-box {
      border: 1px dashed #64748b;
      width: 130px;
      height: 110px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: #64748b;
      text-align: center;
      line-height: 1.35;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .signatory-box {
      text-align: center;
      min-width: 250px;
    }
    .signatory-box .name {
      font-weight: bold;
      font-size: 16.5px;
      border-bottom: 1.5px solid #111;
      padding-bottom: 4px;
    }
    .signatory-box .position {
      font-size: 13.5px;
      margin-top: 4px;
      color: #4b5563;
    }
    .footer-metadata {
      margin-top: 50px;
      padding-top: 15px;
      border-top: 1px solid #cbd5e1;
      font-size: 12px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .action-banner { display: none !important; }
      .certificate-card { box-shadow: none; border: 2px solid #000; padding: 40px; }
    }
  </style>
</head>
<body>
  <div class="action-banner">
    <div>
      <span style="font-size: 16px; font-weight: 700;">Official Barangay Approved Document</span>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Status: Approved &bull; Ready for Printing or PDF Export</div>
    </div>
    <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="certificate-card">
    <div class="watermark-stamp">APPROVED &amp; VERIFIED<br/>STA. RITA CENTRAL</div>
    <div class="official-header">
      <p class="republic">REPUBLIC OF THE PHILIPPINES</p>
      <p>PROVINCE OF LA UNION</p>
      <p>MUNICIPALITY OF AGOO</p>
      <p class="barangay">BARANGAY STA. RITA CENTRAL</p>
      <p class="office">OFFICE OF THE PUNONG BARANGAY</p>
    </div>

    <div class="document-title">${safeDocType}</div>
    <div class="salutation">TO WHOM IT MAY CONCERN:</div>

    <div class="body-paragraphs">
      ${bodyHtml}
      <p>ISSUED this <span class="highlight">${dateIssued}</span> at Barangay Sta. Rita Central, Agoo, La Union, Philippines.</p>
    </div>

    <div class="signatures-row">
      <div class="thumbprint-box">APPLICANT<br/>THUMBPRINT</div>
      <div class="signatory-box">
        <div class="name">HON. FERNANDO C. FABRO</div>
        <div class="position">Punong Barangay (Barangay Captain)</div>
      </div>
    </div>

    <div class="footer-metadata">
      <span>CTC No.: ${ctc}</span>
      <span>OR No.: ${orNum}</span>
      <span>Control No.: BSRC-${safeDocType.slice(0, 3).toUpperCase()}-2026</span>
    </div>
  </div>
</body>
</html>`;

    // Initiate automated download as HTML document
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const cleanFileName = `${safeName.replace(/[^a-zA-Z0-9]/g, "_")}_${safeDocType.replace(/[^a-zA-Z0-9]/g, "_")}_Approved_Letter.html`;
    link.href = url;
    link.download = cleanFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSubmitSuccess(`Official Approved letter for ${safeName} downloaded automatically!`);
    setTimeout(() => setSubmitSuccess(""), 5000);
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
      {/* Header section */}
      <div className="docs-header">
        <h1>{isAdmin ? "Document Requests & Certificate Issuance" : "Request Barangay Document"}</h1>
        <p>
          {isAdmin
            ? "Review and manage resident document requests, accept or decline submissions, and print official certificates."
            : "Select a document type, fill out the required details, and submit your application. Once approved, you can download your official letter."}
        </p>
      </div>

      {/* Notification banner for submissions and downloads */}
      {submitSuccess && (
        <div
          style={{
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
            gap: "8px",
          }}
        >
          <Check size={18} /> {submitSuccess}
        </div>
      )}

      {/* Document Selector Tabs */}
      <div className="docs-type-tabs">
        {DOC_TYPES.map((doc) => (
          /* Button to switch active document template */
          <button
            key={doc.id}
            className={`doc-tab-btn ${activeDocType === doc.id ? "doc-tab-btn--active" : ""}`}
            onClick={() => setActiveDocType(doc.id)}
            title={`Select ${doc.label}`}
          >
            <span>{doc.icon}</span>
            <span>{doc.label}</span>
          </button>
        ))}
      </div>

      {/* Form Workspace Grid */}
      <div className="docs-workspace-grid">
        {/* Editor Form Card */}
        <div className="docs-editor-card">
          <div className="editor-section-title">
            <span>{isAdmin ? "ADMIN DOCUMENT GENERATOR" : "REQUEST FORM DETAILS"}</span>
            <span className="autofill-hint">⚡ LIVE PREVIEW ACTIVE</span>
          </div>

          <form onSubmit={handleSubmitRequest}>
            {/* Applicant Name Input */}
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
                  <span style={{ fontSize: 11, color: "#94a3b8", alignSelf: "center" }}>Quick Fill:</span>
                  {/* Button to quickly auto-fill user's own username */}
                  <button
                    type="button"
                    className="preset-chip"
                    onClick={() => handlePresetSelect(user?.username || "JUAN DELA CRUZ")}
                    title="Fill in your name"
                  >
                    {user?.username || "JUAN DELA CRUZ"}
                  </button>
                </div>
              )}
            </div>

            <div className="modal-form-row">
              {/* Civil Status Selection */}
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

              {/* Age Input */}
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

            {/* Address Input */}
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

            {/* Purpose Input */}
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
                {/* CTC Number Input (Admin) */}
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

                {/* OR Number Input (Admin) */}
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
                /* Button for residents to submit a document request */
                <button
                  type="submit"
                  className="btn-doc-primary btn-doc-single"
                  style={{ width: "100%", fontSize: "15px" }}
                  title="Submit your request to Barangay Admin"
                >
                  Request Documents
                </button>
              ) : (
                <>
                  {/* Button for admin to save request */}
                  <button type="submit" className="btn-doc-primary" title="Save document to database">
                    💾 Save Request
                  </button>
                  {/* Button for admin to print or export current preview */}
                  <button type="button" className="btn-doc-print" onClick={handlePrint} title="Print Certificate">
                    <Printer size={16} /> Print / Export
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Live Printable Preview Template */}
        <div>
          <div
            style={{
              marginBottom: 10,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#94a3b8",
              textTransform: "uppercase",
            }}
          >
            OFFICIAL CERTIFICATE PREVIEW
          </div>
          {renderTemplatePreview()}
        </div>
      </div>

      {/* Document Requests Records Table */}
      <div className="doc-requests-table-card">
        <div
          className="records-card__header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
        >
          <h2 className="records-card__title" style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>
            {isAdmin ? "Resident Document Requests Database" : "My Document Request Status"}
          </h2>
          {/* Button to refresh the requests table list */}
          <button
            className="records-card__view-all"
            onClick={refreshRequests}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#cbd5e1",
              padding: "6px 12px",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
            }}
            title="Refresh requests list"
          >
            <RefreshCw size={14} /> Refresh List
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="records-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>APPLICANT NAME</th>
                <th>DOCUMENT TYPE</th>
                <th>PURPOSE</th>
                <th>STATUS</th>
                <th>DATE REQUESTED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {docRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#94a3b8", padding: "24px" }}>
                    No document requests recorded yet.
                  </td>
                </tr>
              ) : (
                docRequests.map((req) => {
                  const isApproved = req.status === "Approved" || req.status === "Accepted";

                  return (
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
                        {/* Interactive Status Badge: If approved, clicking triggers auto-download */}
                        <span
                          className={`badge-status badge-status--${isApproved ? "settled" : req.status === "Pending" ? "pending" : "unsettled"
                            }`}
                          style={isApproved ? { cursor: "pointer", textDecoration: "underline" } : {}}
                          onClick={() => {
                            if (isApproved) handleDownloadApprovedDocument(req);
                          }}
                          title={isApproved ? "Click to auto-download approved letter" : undefined}
                        >
                          {isApproved ? "Approved 📥" : req.status === "Declined" ? "Declined" : "Pending"}
                        </span>
                      </td>
                      <td>{req.dateRequested}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                          {/* Admin Accept & Decline Action Buttons */}
                          {isAdmin && (
                            <>
                              {/* Button for admin to accept/approve the request */}
                              <button
                                type="button"
                                className="btn-doc-accept"
                                onClick={() => handleAccept(req.id)}
                                title="Accept Request"
                              >
                                <Check size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} />
                                Accept
                              </button>
                              {/* Button for admin to decline the request */}
                              <button
                                type="button"
                                className="btn-doc-decline"
                                onClick={() => handleDecline(req.id)}
                                title="Decline Request"
                              >
                                <X size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} />
                                Decline
                              </button>
                              {/* Button for admin to preview template */}
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
                                  fontWeight: 600,
                                }}
                                title="Preview Certificate"
                              >
                                Preview
                              </button>
                            </>
                          )}

                          {/* Auto-Download Button: Visible to residents and admins when status is Approved */}
                          {isApproved ? (
                            /* Button to automatically download official approved certificate/letter */
                            <button
                              type="button"
                              onClick={() => handleDownloadApprovedDocument(req)}
                              style={{
                                background: "linear-gradient(135deg, #10b981, #059669)",
                                border: "none",
                                color: "#ffffff",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                              }}
                              title="Click to auto-download approved official letter"
                            >
                              <Download size={14} /> Download Letter
                            </button>
                          ) : !isAdmin && (
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                              {req.status === "Declined" ? "Declined" : "Pending approval"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
