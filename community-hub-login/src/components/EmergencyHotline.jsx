import React from "react";
import { hotlines } from "../constants/hubConfig";
import "./EmergencyHotline.css";

export default function EmergencyHotline() {
  return (
    /* Emergency Hotline Contacts Section */
    <section className="hotline" id="hotlines-section" aria-labelledby="hotline-heading">
      <h2 id="hotline-heading" className="hotline__heading">
        Emergency <span style={{ color: "#38bdf8" }}>Hotline</span>
      </h2>
      <div className="hotline__panel">
        {hotlines.map((line) => (
          /* Hotline entry card */
          <div className="hotline__item" key={line.id} title={`Call ${line.label}: ${line.number}`}>
            <span className="hotline__dot" aria-hidden="true" />
            <div>
              <p className="hotline__label">{line.label}</p>
              <p className="hotline__number">{line.number}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
