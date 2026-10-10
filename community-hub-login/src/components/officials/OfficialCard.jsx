import React from "react";
import { MessageSquare, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OfficialCard({ name, role, committee, photo, phone, email }) {
  const navigate = useNavigate();

  const handleMessage = () => {
    navigate("/chats");
  };

  return (
    <div className="official-card">
      <img
        src={photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"}
        alt={name}
        className="official-card__photo"
      />
      <h3 className="official-card__name">{name}</h3>
      <span className="official-card__role">{role}</span>
      <span className="official-card__committee">{committee || "Barangay Governance"}</span>

      <div className="official-card__actions">
        <button className="btn-official-contact" onClick={handleMessage}>
          <MessageSquare size={14} /> Message
        </button>
        {phone && (
          <a className="btn-official-contact" href={`tel:${phone}`}>
            <Phone size={14} /> Call
          </a>
        )}
      </div>
    </div>
  );
}
