import React from "react";
import { User, Phone, Mail } from "lucide-react";
import "./OfficialCard.css";

export default function OfficialCard({ official, variant = "kagawad" }) {
  const isCaptain = variant === "captain";

  return (
    <article className={"official-card" + (isCaptain ? " official-card--captain" : "")}>
      <div className="official-card__avatar">
        <User size={isCaptain ? 34 : 26} strokeWidth={1.6} />
      </div>
      <p className="official-card__name">{official.name}</p>
      <p className="official-card__position">{isCaptain ? official.position : official.role}</p>

      {isCaptain ? (
        <>
          {official.badge && <span className="official-card__badge">{official.badge}</span>}
          <div className="official-card__contact">
            {official.phone && (
              <span>
                <Phone size={13} strokeWidth={1.8} /> {official.phone}
              </span>
            )}
            {official.email && (
              <span>
                <Mail size={13} strokeWidth={1.8} /> {official.email}
              </span>
            )}
          </div>
        </>
      ) : (
        official.committee && <span className="official-card__badge">{official.committee}</span>
      )}
    </article>
  );
}
