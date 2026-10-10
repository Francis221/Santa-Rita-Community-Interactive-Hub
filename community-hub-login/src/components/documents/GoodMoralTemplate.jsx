import React from "react";

export default function GoodMoralTemplate({ data }) {
  const {
    applicantName = "FRANCIS REGIE DE GUZMAN",
    civilStatus = "Single",
    address = "Purok 3, Sta. Rita Central, Agoo, La Union",
    purpose = "Scholarship / School Requirement",
    dateIssued = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    ctcNo = "CTC-2026-8799",
    orNo = "OR-98921",
  } = data;

  return (
    <div className="doc-template-card" id="printable-document">
      {/* Official Header */}
      <div className="doc-header-official">
        <img src="/src/components/photo/logostarita.jpg" alt="Barangay Official Seal" className="doc-seal-img" />
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
        CERTIFICATE OF GOOD MORAL CHARACTER
      </div>

      {/* Document Body Text */}
      <div className="doc-body-official">
        <p style={{ fontWeight: 'bold', textIndent: 0, fontSize: 16 }}>TO WHOM IT MAY CONCERN:</p>
        <p>
          THIS IS TO CERTIFY that <span className="doc-highlight">{applicantName || "_______________________"}</span>, 
          of legal age, <span className="doc-highlight">{civilStatus}</span>, Filipino citizen, residing at 
          <span className="doc-highlight"> {address}</span>, is a resident of good moral standing in this community.
        </p>
        <p>
          THIS IS TO FURTHER CERTIFY that he/she is known to be law-abiding, trustworthy, and active in community affairs, 
          and has maintained clean moral integrity without involvement in any unlawful activities.
        </p>
        <p>
          THIS CERTIFICATION is issued upon request of the above-named individual for <span className="doc-highlight">{purpose || "Scholarship / Educational Requirement"}</span>.
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
            OFFICIAL<br />SEAL
          </div>
          <div className="signatory-box">
            <div className="signatory-name">HON. JUAN DE LA CRUZ</div>
            <div className="signatory-title">Punong Barangay</div>
          </div>
        </div>

        <div className="doc-footer-details">
          <span>CTC No.: {ctcNo}</span>
          <span>OR No.: {orNo}</span>
          <span>Control #: BSRC-GMC-{new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
