import React from "react";
import barangaySeal from "../photo/logostarita.jpg";

export default function IndigencyTemplate({ data }) {
  const {
    applicantName = "FRANCIS REGIE DE GUZMAN",
    age = 25,
    civilStatus = "Single",
    address = "Purok 3, Sta. Rita Central, Agoo, La Union",
    purpose = "Financial & Medical Assistance",
    dateIssued = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    ctcNo = "N/A",
    orNo = "GRATIS",
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
        CERTIFICATE OF INDIGENCY
      </div>

      {/* Document Body Text */}
      <div className="doc-body-official">
        <p style={{ fontWeight: 'bold', textIndent: 0, fontSize: 16 }}>TO WHOM IT MAY CONCERN:</p>
        <p>
          THIS IS TO CERTIFY that <span className="doc-highlight">{applicantName || "_______________________"}</span>,{" "}
          <span className="doc-highlight">{age} years old</span>, <span className="doc-highlight">{civilStatus}</span>, Filipino citizen, is a permanent resident of{" "}
          <span className="doc-highlight">{address}</span>.
        </p>
        <p>
          THIS IS TO FURTHER CERTIFY that the above-named person belongs to an indigent family in this barangay 
          with no fixed or regular monthly income sufficient for emergency living and social requirements.
        </p>
        <p>
          THIS CERTIFICATION is issued upon request of the interested party for the purpose of securing 
          <span className="doc-highlight"> {purpose || "Medical / Educational / Financial Assistance"}</span>.
        </p>
        <p>
          GIVEN AND ISSUED this <span className="doc-highlight">{dateIssued}</span> at Barangay Sta. Rita Central, 
          Agoo, La Union, Philippines.
        </p>
      </div>

      {/* Signatures & Footer */}
      <div>
        <div className="doc-signatures-official">
          <div className="thumbprint-box">
            OFFICIAL<br />BARANGAY SEAL
          </div>
          <div className="signatory-box">
            <div className="signatory-name">HON. JUAN DE LA CRUZ</div>
            <div className="signatory-title">Punong Barangay</div>
          </div>
        </div>

        <div className="doc-footer-details">
          <span>Fee: GRATIS (Indigent)</span>
          <span>OR No.: {orNo}</span>
          <span>Control #: BSRC-IND-{new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
