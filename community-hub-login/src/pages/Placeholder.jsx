import React from "react";
import "./Placeholder.css";

export default function Placeholder({ title }) {
  return (
    <div className="page">
      <div className="placeholder">
        <p className="placeholder__eyebrow">Barangay Module</p>
        <h1 className="placeholder__title">{title}</h1>
        <p className="placeholder__body">
          Welcome to the <strong>{title}</strong> management area for Sta. Rita Central, Agoo, La Union.
        </p>
      </div>
    </div>
  );
}
