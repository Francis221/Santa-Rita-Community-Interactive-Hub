import React from "react";
import { captain, kagawad } from "../../constants/hubConfig";
import OfficialCard from "./OfficialCard";
import { Shield, MessageSquare, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./officials.css";

export default function OfficialsPage() {
  const navigate = useNavigate();

  return (
    <div className="page officials-page">
      <div className="officials-header">
        <h1>Barangay Officials</h1>
        <p>Meet your elected leaders and council committee heads of Sta. Rita Central, Agoo, La Union.</p>
      </div>

      {/* Barangay Captain Featured Banner */}
      <div className="official-captain-banner">
        <img src={captain.photo} alt={captain.name} className="captain-photo" />
        <div className="captain-info" style={{ flex: 1 }}>
          <span className="captain-badge">{captain.badge}</span>
          <h2>{captain.name}</h2>
          <div className="captain-title">{captain.position}</div>
          <p style={{ color: "#cbd5e1", fontSize: "0.9rem", margin: "0 0 1rem 0" }}>
            Leading our barangay in transparent governance, community safety, and inclusive public service.
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="btn-add-announcement"
              onClick={() => navigate("/chats")}
            >
              <MessageSquare size={16} /> Send Direct Message
            </button>
            <a
              className="btn-official-contact"
              href={`tel:${captain.phone}`}
              style={{ padding: "0.6rem 1rem", fontSize: "0.9rem", flex: "none" }}
            >
              <Phone size={16} /> Call {captain.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Kagawads & Committee Heads Grid */}
      <h2 style={{ fontSize: "1.25rem", color: "#f8fafc", margin: "1rem 0 0.5rem 0" }}>
        Barangay Council Members &amp; Committee Chairpersons
      </h2>

      <div className="officials-grid">
        {kagawad.map((official) => (
          <OfficialCard
            key={official.id}
            name={official.name}
            role={official.role}
            committee={official.committee}
            photo={official.photo}
          />
        ))}
      </div>
    </div>
  );
}
