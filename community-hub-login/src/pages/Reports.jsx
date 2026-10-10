import React, { useState, useEffect } from "react";
import { DB } from "../services/db";
import AddReportModal from "../components/reports/AddReportModal";
import EditReportModal from "../components/reports/EditReportModal";
import SettleReportModal from "../components/reports/SettleReportModal";
import RequestDocsModal from "../components/reports/RequestDocsModal";
import MonthlyReportsChart from "../components/reports/MonthlyReportsChart";
import "../components/reports/Reports.css";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'add', 'edit', 'settle', 'docs', or null

  const refreshReports = () => {
    setReports(DB.getReports());
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
          <button
            className="btn-report btn-report--add"
            onClick={() => setActiveModal("add")}
          >
            Add Report
          </button>
          <button
            className="btn-report btn-report--settle"
            onClick={() => setActiveModal("settle")}
          >
            Settle Report
          </button>
          <button
            className="btn-report btn-report--edit"
            onClick={() => setActiveModal("edit")}
          >
            Edit Report
          </button>
          <button
            className="btn-report btn-report--docs"
            onClick={() => setActiveModal("docs")}
          >
            REQUEST DOCS
          </button>
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

      {activeModal === "docs" && (
        <RequestDocsModal
          onClose={() => setActiveModal(null)}
          onRequestUpdated={refreshReports}
        />
      )}
    </div>
  );
}
