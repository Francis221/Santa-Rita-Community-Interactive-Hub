import React from "react";
import barangaySeal from "../photo/logostarita.jpg";

export default function ResidencyTemplate({ data }) {
  const {
    applicantName = "FRANCIS REGIE DE GUZMAN",
    age = 25,
    civilStatus = "Single",
    address = "Purok 3, Sta. Rita Central, Agoo, La Union",
    purpose = "Proof of Residency / Employment Requirement",
    dateIssued = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    ctcNo = "CTC-2026-8810",
    orNo = "OR-99044",
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
        CERTIFICATE OF BARANGAY RESIDENCY
      </div>

      {/* Document Body Text */}
      <div className="doc-body-official">
        <p style={{ fontWeight: 'bold', textIndent: 0, fontSize: 16 }}>TO WHOM IT MAY CONCERN:</p>
        <p>
          THIS IS TO CERTIFY that <span className="doc-highlight">{applicantName || "_______________________"}</span>, 
          of legal age, <span className="doc-highlight">{civilStatus}</span>, Filipino citizen, is a bona fide resident of 
          <span className="doc-highlight"> {address}</span>.
        </p>
        <p>
          BASED ON THE RECORDS OF THIS OFFICE, the above-named individual has been residing in Barangay Sta. Rita Central, 
          Agoo, La Union, and is known to be of good moral character and a law-abiding citizen in the community.
        </p>
        <p>
          THIS CERTIFICATION is issued upon request of the interested party for <span className="doc-highlight">{purpose || "whatever legal purpose it may serve"}</span>.
        </p>
        <p>
          ISSUED this <span className="doc-highlight">{dateIssued}</span> at the Office of the Punong Barangay, Barangay Sta. Rita Central, 
          Agoo, La Union, Philippines.
        </p>
      </div>

      {/* Signatures & Footer */}
      <div>
        <div className="doc-signatures-official">
          <div className="thumbprint-box">
            LEFT / RIGHT<br />THUMBPRINT
          </div>
          <div className="signatory-box">
            <div className="signatory-name">HON. JUAN DE LA CRUZ</div>
            <div className="signatory-title">Punong Barangay</div>
          </div>
        </div>

        <div className="doc-footer-details">
          <span>CTC No.: {ctcNo}</span>
          <span>OR No.: {orNo}</span>
          <span>Control #: BSRC-RES-{new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
