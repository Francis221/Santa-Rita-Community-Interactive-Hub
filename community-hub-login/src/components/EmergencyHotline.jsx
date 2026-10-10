import React from "react";
import { hotlines } from "../constants/hubConfig";
import "./EmergencyHotline.css";

export default function EmergencyHotline() {
  return (
    <section className="hotline" aria-labelledby="hotline-heading">
      <h2 id="hotline-heading" className="hotline__heading">
        Emergency <span style={{ color: "blue" }}>Hotline</span>
      </h2>
      <div className="hotline__panel">
        {hotlines.map((line) => (
          <div className="hotline__item" key={line.id}>
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
