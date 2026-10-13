import React from "react";
import barangaySeal from "../photo/logostarita.jpg";

export default function ClearanceTemplate({ data }) {
  const {
    applicantName = "FRANCIS REGIE DE GUZMAN",
    age = 25,
    civilStatus = "Single",
    address = "Purok 3, Sta. Rita Central, Agoo, La Union",
    purpose = "Employment Requirement",
    dateIssued = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    ctcNo = "CTC-2026-8841",
    orNo = "OR-99120",
  } = data;

  return (
    <div className="doc-template-card" id="printable-document">
      {/* Official Header */}
      <div className="doc-header-official">
        <img src={barangaySeal} alt="Barangay Official Seal" className="doc-seal-img" />
        <div className="doc-header-text">
          <p className="republic-line">REPUBLIC OF THE PHILIPPINES</p>
          <p>PROVINCE OF LA UNION</p>
          <p>MUNICIPALITY OF AGOO</p>
          <p style={{ fontWeight: 'bold' }}>BARANGAY STA. RITA CENTRAL</p>
          <p className="office-line">OFFICE OF THE PUNONG BARANGAY</p>
        </div>
      </div>

      {/* Document Title */}
      <div className="doc-title-official">
        BARANGAY CLEARANCE
      </div>

      {/* Document Body Text */}
      <div className="doc-body-official">
        <p style={{ fontWeight: 'bold', textIndent: 0, fontSize: 16 }}>TO WHOM IT MAY CONCERN:</p>
        <p>
          THIS IS TO CERTIFY that <span className="doc-highlight">{applicantName || "_______________________"}</span>,{" "}
          <span className="doc-highlight">{age} years old</span>, <span className="doc-highlight">{civilStatus}</span>, Filipino citizen, residing at{" "}
          <span className="doc-highlight">{address}</span>, is a person of good moral character and reputable standing in our community.
        </p>
        <p>
          ACCORDING TO THE RECORDS FILED IN THIS OFFICE, he/she has <span className="doc-highlight">NO DEROGATORY RECORD</span> or 
          pending criminal/civil complaint filed against him/her in this Barangay.
        </p>
        <p>
          THIS BARANGAY CLEARANCE is issued upon request of the above-named person for the purpose of 
          <span className="doc-highlight"> {purpose || "Employment / Local Record Clearance"}</span>.
        </p>
        <p>
          GIVEN THIS <span className="doc-highlight">{dateIssued}</span> at Barangay Sta. Rita Central, 
          Agoo, La Union, Philippines.
        </p>
      </div>

      {/* Signatures & Footer */}
      <div>
        <div className="doc-signatures-official">
          <div className="thumbprint-box">
            APPLICANT<br />THUMBPRINT
          </div>
          <div className="signatory-box">
            <div className="signatory-name">HON. JUAN DE LA CRUZ</div>
            <div className="signatory-title">Punong Barangay</div>
          </div>
        </div>

        <div className="doc-footer-details">
          <span>CTC No.: {ctcNo}</span>
          <span>OR No.: {orNo}</span>
          <span>Control #: BSRC-CLR-{new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
