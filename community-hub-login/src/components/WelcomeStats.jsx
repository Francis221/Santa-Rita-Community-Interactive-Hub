import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Home as HomeIcon, Globe, AlertCircle, Edit3 } from "lucide-react";
import { stats as initialStatsConfig } from "../constants/hubConfig";
import { DB } from "../services/db";
import { useAuth } from "../context/AuthContext";
import EditStatsModal from "./EditStatsModal";
import "./WelcomeStats.css";

const ICONS = { Users, Home: HomeIcon, Globe, AlertCircle };

export default function WelcomeStats() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dbStats, setDbStats] = useState(DB.getStats());
  const [csrfToken, setCsrfToken] = useState("");
  const [activeReportsCount, setActiveReportsCount] = useState(0);
  const [liveLoginStats, setLiveLoginStats] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchStatsFromApi = async () => {
    try {
      const res = await fetch("/api/stats.php", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.stats) {
          setDbStats(data.stats);
          DB.updateStats(data.stats);
          if (data.csrf_token) setCsrfToken(data.csrf_token);
          if (typeof data.stats.reports === "number") {
            setActiveReportsCount(data.stats.reports);
          }
        }
      }
    } catch (e) {}
  };

  const refreshData = async () => {
    fetchStatsFromApi();
    const reports = DB.getReports();
    const activeCount = reports.filter((r) => r.status !== "Settled").length;
    setActiveReportsCount(activeCount);

    try {
      const live = await DB.fetchLoginLogsSummary();
      if (live) setLiveLoginStats(live);
    } catch (e) {}
  };

  useEffect(() => {
    fetchStatsFromApi();
    refreshData();
    window.addEventListener("storage", refreshData);
    window.addEventListener("reportsUpdated", refreshData);
    window.addEventListener("statsUpdated", refreshData);

    const interval = setInterval(() => {
      DB.fetchUsersFromApi();
      refreshData();
    }, 5000);

    return () => {
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("reportsUpdated", refreshData);
      window.removeEventListener("statsUpdated", refreshData);
      clearInterval(interval);
    };
  }, []);

  const displayName = user?.username || "Resident";
  const isAdmin = user?.role === "Admin";

  const handleCardClick = (statId) => {
    if (statId === "reports") {
      navigate(isAdmin ? "/reports" : "/my-reports");
    } else if (statId === "online") {
      navigate("/find-friends");
    } else if ((statId === "population" || statId === "household") && isAdmin) {
      setIsEditModalOpen(true);
    }
  };

  return (
    <section className="welcome" aria-labelledby="welcome-heading">
      <h1 id="welcome-heading" className="welcome__heading">
        Welcome back, <span style={{ color: 'blue' }}>{displayName} </span>
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', margin: '4px 0 24px' }}>
        <h2 className="welcome__subheading" style={{ margin: 0 }}>
          Barangay <span>Statistics</span>
        </h2>

        {isAdmin && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              color: '#60a5fa',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Edit Barangay Population, Household & Online stats"
          >
            <Edit3 size={15} /> Edit Stats
          </button>
        )}
      </div>

      <div className="welcome__stats">
        {initialStatsConfig.map((stat) => {
          const Icon = ICONS[stat.icon];
          let val = stat.value;

          if (stat.id === "population") {
            val = dbStats.population || "12,480";
          } else if (stat.id === "household") {
            val = dbStats.household || "3,150";
          } else if (stat.id === "reports") {
            val = activeReportsCount;
          } else if (stat.id === "online") {
            val = DB.getOnlineCount();
          }

          return (
            <div
              className="stat-card"
              key={stat.id}
              onClick={() => handleCardClick(stat.id)}
              style={{ cursor: "pointer", position: "relative" }}
              title={
                stat.id === "reports"
                  ? "Click to view Active Reports"
                  : stat.id === "online"
                  ? "Click to view Online Chats & Neighbors"
                  : isAdmin
                  ? "Click to Edit Stats"
                  : stat.label
              }
            >
              {stat.id === "online" && (
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#34d399",
                    background: "rgba(16, 185, 129, 0.15)",
                    padding: "2px 6px",
                    borderRadius: 999
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }}></span>
                  LIVE
                </span>
              )}
              <p className={"stat-card__value" + (stat.tone === "red" ? " stat-card__value--red" : "")}>
                {val}
              </p>
              <Icon
                size={22}
                strokeWidth={1.8}
                className="stat-card__icon"
                color={stat.tone === "red" ? "var(--accent-red)" : "var(--accent-blue-light)"}
              />
              <p className="stat-card__label">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <p className="welcome__featured-label">Featured</p>
      <div className="welcome__featured">
        <div className="welcome__featured-item" />
        <div className="welcome__featured-item" />
      </div>

      {isEditModalOpen && (
        <EditStatsModal
          onClose={() => setIsEditModalOpen(false)}
          onSaved={(newStats) => {
            if (newStats) {
              setDbStats((prev) => ({ ...prev, ...newStats }));
            }
            refreshData();
          }}
          currentStats={dbStats}
          csrfToken={csrfToken}
        />
      )}
    </section>
  );
}
