import React, { useState, useEffect } from "react";
import { DB } from "../../services/db";
import AddReportModal from "./AddReportModal";
import EditReportModal from "./EditReportModal";
import SettleReportModal from "./SettleReportModal";
import DeleteReportModal from "./DeleteReportModal";
import RequestDocsModal from "./RequestDocsModal";
import MonthlyReportsChart from "./MonthlyReportsChart";
import { Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Reports.css";

export default function Reports() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [reports, setReports] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'add', 'edit', 'settle', 'delete', 'docs', or null

  const refreshReports = () => {
    setReports(DB.getReports());
  };

  const handleDeleteReport = (id, title) => {
    if (window.confirm(`Are you sure you want to delete report "${title || 'item'}"?`)) {
      DB.deleteReport(id);
      refreshReports();
    }
  };



  useEffect(() => {
    refreshReports();
    DB.fetchReportsFromApi().then(data => { if (data) setReports(data); });

    const handleUpdate = () => refreshReports();
    window.addEventListener("reportsUpdated", handleUpdate);

    const interval = setInterval(() => {
      DB.fetchReportsFromApi().then(data => { if (data) setReports(data); });
    }, 3000);

    return () => {
      window.removeEventListener("reportsUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Compute counts
  const settledCount = reports.filter((r) => r.status === "Settled").length;
  const unsettledCount = reports.filter((r) => r.status === "Unsettled").length;
  const pendingCount = reports.filter((r) => r.status === "Pending").length;
  const scheduledCount = reports.filter((r) => r.status === "Scheduled").length;

  return (
    <div className="page reports-page">
      {/* Header Section */}
      <div className="reports-header">
        <div className="reports-header__info">
          <h1>Reports</h1>
          <p>Track, settle and review community cases.</p>
        </div>
        <div className="reports-header__actions">
          {/* Button to open Add Report modal */}
          <button
            className="btn-report btn-report--add"
            onClick={() => setActiveModal("add")}
            title="Add a new community report"
          >
            Add Report
          </button>

          {/* Button to open Delete Report selection modal */}
          <button
            className="btn-report btn-report--delete"
            onClick={() => setActiveModal("delete")}
            title="Open report deletion manager"
          >
            <Trash2 size={16} />
            Delete Report
          </button>

          {isAdmin && (
            <>
              {/* Button to open Settle Report resolution modal (Admin only) */}
              <button
                className="btn-report btn-report--settle"
                onClick={() => setActiveModal("settle")}
                title="Mark a case report as settled"
              >
                Settle Report
              </button>
              {/* Button to open Edit Report details modal (Admin only) */}
              <button
                className="btn-report btn-report--edit"
                onClick={() => setActiveModal("edit")}
                title="Edit an existing case report"
              >
                Edit Report
              </button>
            </>
          )}

          {/* Button to open Request Document modal directly from Reports */}

        </div>
      </div>

      {/* Top 4 Stat Cards matching screenshot 1 */}
      <div className="reports-stats-grid">
        <div className="rep-stat-card">
          <div className="rep-stat-icon rep-stat-icon--settled">
            <span style={{ fontSize: 18 }}>🟢</span>
          </div>
          <div>
            <div className="rep-stat-number">{settledCount}</div>
            <div className="rep-stat-label">Settled cases</div>
          </div>
        </div>

        <div className="rep-stat-card">
          <div className="rep-stat-icon rep-stat-icon--unsettled">
            <span style={{ fontSize: 18 }}>🔴</span>
          </div>
          <div>
            <div className="rep-stat-number">{unsettledCount}</div>
            <div className="rep-stat-label">Unsettled cases</div>
          </div>
        </div>

        <div className="rep-stat-card">
          <div className="rep-stat-icon rep-stat-icon--pending">
            <span style={{ fontSize: 18 }}>🟠</span>
          </div>
          <div>
            <div className="rep-stat-number">{pendingCount}</div>
            <div className="rep-stat-label">Pending cases</div>
          </div>
        </div>

        <div className="rep-stat-card">
          <div className="rep-stat-icon rep-stat-icon--scheduled">
            <span style={{ fontSize: 18 }}>🟣</span>
          </div>
          <div>
            <div className="rep-stat-number">{scheduledCount}</div>
            <div className="rep-stat-label">Scheduled cases</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Records Table vs Monthly Reports Chart */}
      <div className="reports-main-grid">
        <div className="records-card">
          <div className="records-card__header">
            <h2 className="records-card__title">Recent Records</h2>
            <button className="records-card__view-all" onClick={refreshReports}>
              View all
            </button>
          </div>

          <table className="records-table">
            <thead>
              <tr>
                <th>TITLE</th>
                <th>PARTIES</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((rep) => {
                const statusClass =
                  rep.status === "Settled"
                    ? "settled"
                    : rep.status === "Pending"
                      ? "pending"
                      : "unsettled";

                return (
                  <tr key={rep.id}>
                    <td>
                      <div className="records-table__title-cell">
                        <span className={`record-dot record-dot--${statusClass}`} />
                        <span>{rep.title}</span>
                      </div>
                    </td>
                    <td>{rep.parties}</td>
                    <td>
                      <span className={`badge-status badge-status--${statusClass}`}>
                        {rep.status}
                      </span>
                    </td>
                    <td>{rep.dateFiled}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteReport(rep.id, rep.title)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "0.85rem",
                          fontWeight: 500,
                        }}
                        title="Delete Report"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Column: Monthly Reports SVG Chart & Stats */}
        <MonthlyReportsChart reports={reports} />
      </div>

      {/* Modals */}
      {activeModal === "add" && (
        <AddReportModal
          onClose={() => setActiveModal(null)}
          onReportAdded={refreshReports}
        />
      )}

      {activeModal === "edit" && (
        <EditReportModal
          reports={reports}
          onClose={() => setActiveModal(null)}
          onReportUpdated={refreshReports}
        />
      )}

      {activeModal === "settle" && (
        <SettleReportModal
          reports={reports}
          onClose={() => setActiveModal(null)}
          onReportSettled={refreshReports}
        />
      )}

      {activeModal === "delete" && (
        <DeleteReportModal
          reports={reports}
          onClose={() => setActiveModal(null)}
          onReportDeleted={refreshReports}
        />
      )}



    </div>
  );
}
