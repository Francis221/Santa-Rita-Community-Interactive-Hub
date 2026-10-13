import React, { useState, useEffect, useMemo, useCallback } from "react";
import OfficialCard from "./OfficialCard";
import OfficialModal from "./OfficialModal";
import { Plus, Phone, Pencil, Power } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import captainPhoto from "../photo/Punong_barangay.png";
import "./officials.css";

const KAGAWAD_SEATS = 7;

// is_active may be missing (public list), 1/0, "1"/"0" or true/false
const isActive = (o) => o.is_active == null || Number(o.is_active) === 1;

// Every official lands in exactly ONE tier (position text first, rank_order as fallback)
function tierOf(o) {
  const p = (o.position || "").toLowerCase();
  if (p.includes("punong") || p.includes("captain")) return "captain";
  if (/\bsk\b|kabataan/.test(p)) return "sk";
  if (p.includes("secretary")) return "secretary";
  if (p.includes("treasurer")) return "treasurer";
  if (p.includes("kagawad") || p.includes("sangguniang barangay")) return "kagawad";
  const r = Number(o.rank_order);
  if (r === 1) return "captain";
  if (r >= 2 && r <= 8) return "kagawad";
  if (r === 9) return "sk";
  if (r === 10) return "secretary";
  if (r === 11) return "treasurer";
  return "other";
}

const byRank = (a, b) =>
  (Number(a.rank_order) || 999) - (Number(b.rank_order) || 999) ||
  (a.name || "").localeCompare(b.name || "");

const year = (d) => (d ? String(d).slice(0, 4) : "");
const termText = (o) => {
  const s = year(o.term_start);
  const e = year(o.term_end);
  return s || e ? `Term ${s || "?"}–${e || "present"}` : "";
};

function Tier({ title, hideTitle, aside, className = "", children }) {
  return (
    <section className={`tier ${className}`}>
      <header className={`tier__head ${hideTitle ? "visually-hidden" : ""}`}>
        <h2>{title}</h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

function Slot({ official, ...cardProps }) {
  return (
    <div className={`official-slot ${isActive(official) ? "" : "is-inactive"}`}>
      <OfficialCard official={official} {...cardProps} />
    </div>
  );
}

function CaptainBanner({ captain, isAdmin, onEdit, onToggleActive }) {
  const term = termText(captain);
  return (
    <div className="official-captain-banner">
      <img
        src={captain.photo || captainPhoto}
        alt={captain.name}
        className="captain-photo"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = captainPhoto;
        }}
      />
      <div className="captain-info">
        <span className="captain-badge">Head of council</span>
        <h2>{captain.name}</h2>
        <div className="captain-title">{captain.position}</div>
        <p className="captain-meta">
          {captain.committee || "Executive Governance & General Administration"}
          {term && <> &middot; {term}</>}
        </p>

        <div className="captain-actions">
          {captain.phone && (
            <a className="btn-official-contact" href={`tel:${captain.phone}`}>
              <Phone size={14} /> Call {captain.phone}
            </a>
          )}
          {isAdmin && (
            <>
              <button type="button" className="btn-official-contact" onClick={() => onEdit(captain)}>
                <Pencil size={14} /> Edit
              </button>
              <button type="button" className="btn-official-contact" onClick={() => onToggleActive(captain)}>
                <Power size={14} /> Deactivate
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OfficialsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingOfficial, setEditingOfficial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOfficials = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = isAdmin
        ? "/api/officials.php?action=list&all=1"
        : "/api/officials.php?action=list";
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data?.success || !Array.isArray(data.officials)) {
        throw new Error(data?.error || "Unexpected response from server.");
      }
      setOfficials(data.officials);
    } catch (err) {
      console.error("Failed to fetch officials:", err);
      setError("Could not load the officials list.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchOfficials();
  }, [fetchOfficials]);

  const handleAddOfficial = () => {
    setEditingOfficial(null);
    setIsModalOpen(true);
  };

  const handleEditOfficial = (official) => {
    setEditingOfficial(official);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (official) => {
    const verb = isActive(official) ? "Deactivate" : "Activate";
    if (!window.confirm(`${verb} official "${official.name}"?`)) return;

    try {
      const res = await fetch("/api/officials.php?action=toggle_active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: official.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice(data.error || "Failed to change active status.");
        return;
      }
      setNotice("");
      fetchOfficials();
    } catch {
      setNotice("Could not reach the server. Try again.");
    }
  };

  // Hierarchy: Captain > Kagawads > SK Chair > Secretary > Treasurer
  const { groups, inactive } = useMemo(() => {
    const g = { captain: [], kagawad: [], sk: [], secretary: [], treasurer: [], other: [] };
    const off = [];
    [...officials].sort(byRank).forEach((o) => (isActive(o) ? g[tierOf(o)].push(o) : off.push(o)));
    return { groups: g, inactive: off };
  }, [officials]);

  const captain = groups.captain[0];
  const cardProps = { isAdmin, onEdit: handleEditOfficial, onToggleActive: handleToggleActive };

  const singleTier = (key, title, emptyText) => {
    const list = groups[key];
    if (!list.length && !isAdmin) return null;
    return (
      <Tier title={title} className="tier--single">
        {list.length ? (
          <div className="officials-grid">
            {list.map((o) => (
              <Slot key={o.id} official={o} {...cardProps} />
            ))}
          </div>
        ) : (
          <p className="tier-empty">{emptyText}</p>
        )}
      </Tier>
    );
  };

  // One column of the Secretary / Treasurer row
  const pairCol = (key, title, emptyText) => {
    const list = groups[key];
    if (!list.length && !isAdmin) return null;
    return (
      <div className="pair-col">
        <header className="tier__head">
          <h2>{title}</h2>
        </header>
        {list.length ? (
          <div className="officials-grid">
            {list.map((o) => (
              <Slot key={o.id} official={o} {...cardProps} />
            ))}
          </div>
        ) : (
          <p className="tier-empty">{emptyText}</p>
        )}
      </div>
    );
  };

  return (
    <div className="page officials-page">
      <header className="officials-header">
        <div>
          <h1>Barangay Officials Hierarchy</h1>
          <p>
            Official organizational chart and committee leadership of Barangay Sta. Rita Central,
            Agoo, La Union.
          </p>
        </div>

        {isAdmin && (
          <button type="button" className="btn-add-announcement officials-add" onClick={handleAddOfficial}>
            <Plus size={18} /> Add official
          </button>
        )}
      </header>

      {isAdmin && groups.captain.length > 1 && (
        <div className="officials-notice" role="alert">
          There are {groups.captain.length} active Punong Barangay records. Only one can be shown;
          deactivate the extra record.
        </div>
      )}

      {notice && (
        <div className="officials-notice" role="alert">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">
            &times;
          </button>
        </div>
      )}

      {loading ? (
        <p className="officials-state" aria-busy="true">Loading officials…</p>
      ) : error ? (
        <div className="officials-state">
          <p>{error}</p>
          <button type="button" className="btn-official-contact" onClick={fetchOfficials}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="org-chart">
            <Tier title="Punong Barangay" hideTitle className="tier--captain">
              {captain ? (
                <CaptainBanner captain={captain} {...cardProps} />
              ) : (
                <p className="tier-empty">No active Punong Barangay yet.</p>
              )}
            </Tier>
            {(groups.secretary.length > 0 || groups.treasurer.length > 0 || isAdmin) && (
              <section className="tier tier--pair">
                <div className="pair-row">
                  {pairCol("secretary", "Barangay Secretary", "No active Barangay Secretary yet.")}
                  {pairCol("treasurer", "Barangay Treasurer", "No active Barangay Treasurer yet.")}
                </div>
              </section>
            )}
            <Tier
              title="Sangguniang Barangay Members (Kagawads)"
              aside={
                <span className={`tier__count ${groups.kagawad.length > KAGAWAD_SEATS ? "is-over" : ""}`}>
                  {groups.kagawad.length} of {KAGAWAD_SEATS} seats filled
                </span>
              }
            >
              {groups.kagawad.length ? (
                <div className="officials-grid">
                  {groups.kagawad.map((o) => (
                    <Slot key={o.id} official={o} {...cardProps} />
                  ))}
                </div>
              ) : (
                <p className="tier-empty">No active Kagawads yet.</p>
              )}
            </Tier>




          </div>

          {groups.other.length > 0 && (
            <Tier title="Other positions">
              <div className="officials-grid">
                {groups.other.map((o) => (
                  <Slot key={o.id} official={o} {...cardProps} />
                ))}
              </div>
            </Tier>
          )}

          {isAdmin && inactive.length > 0 && (
            <details className="inactive-block">
              <summary>Inactive officials ({inactive.length})</summary>
              <div className="officials-grid">
                {inactive.map((o) => (
                  <Slot key={o.id} official={o} {...cardProps} />
                ))}
              </div>
            </details>
          )}
        </>
      )}

      {isModalOpen && (
        <OfficialModal
          official={editingOfficial}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => fetchOfficials()}
        />
      )}
    </div>
  );
}