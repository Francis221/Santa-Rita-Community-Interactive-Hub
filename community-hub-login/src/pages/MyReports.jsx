import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AddReportModal from "../components/reports/AddReportModal";
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Calendar,
  MapPin,
  User,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import "./MyReports.css";

export default function MyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        action: "my_reports",
        search: search.trim(),
        status: statusFilter,
        page: String(page),
        limit: "8",
      });

      const res = await fetch(`/api/reports.php?${query.toString()}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.reports)) {
          setReports(data.reports);
          setTotalCount(data.total || data.reports.length);
          setTotalPages(data.pages || 1);
        }
      }
    } catch (err) {
      console.error("Failed to load resident reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [search, statusFilter, page]);

  // Open single report detail modal (with IDOR prevention check on backend)
  const handleOpenDetail = async (reportId) => {
    try {
      const res = await fetch(`/api/reports.php?action=get&id=${encodeURIComponent(reportId)}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data && data.success && data.report) {
        setSelectedReport(data.report);
      } else {
        alert(data.error || "Unable to open report details (Access Restricted).");
      }
    } catch (e) {
      alert("Error loading report details.");
    }
  };

  // Status badge renderer
  const renderStatusBadge = (status) => {
    const s = (status || "Pending").toLowerCase();
    if (s.includes("resolve") || s.includes("settle")) {
      return (
        <span className="badge-status badge-status--resolved">
          <CheckCircle2 size={12} /> Resolved
        </span>
      );
    }
    if (s.includes("progress")) {
      return (
        <span className="badge-status badge-status--inprogress">
          <Clock size={12} /> In Progress
        </span>
      );
    }
    if (s.includes("reject")) {
      return (
        <span className="badge-status badge-status--rejected">
          <XCircle size={12} /> Rejected
        </span>
      );
    }
    return (
      <span className="badge-status badge-status--pending">
        <AlertCircle size={12} /> Pending
      </span>
    );
  };

  // Compute local counts
  const pendingCount = reports.filter((r) => (r.status || "").toLowerCase().includes("pending")).length;
  const inProgressCount = reports.filter((r) => (r.status || "").toLowerCase().includes("progress")).length;
  const resolvedCount = reports.filter((r) => {
    const s = (r.status || "").toLowerCase();
    return s.includes("settle") || s.includes("resolve");
  }).length;

  return (
    <div className="page my-reports-page">
      {/* Header */}
      <div className="my-reports-header">
        <div>
          <h1>My Filed Reports</h1>
          <p>Track the status, timeline, and barangay lupon resolution of your submitted complaints.</p>
        </div>
        <button
          className="btn-file-report"
          onClick={() => setIsAddModalOpen(true)}
          title="File a new community incident report"
        >
          <PlusCircle size={18} />
          <span>File a Report</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="my-reports-stats">
        <div className="mr-stat-card">
          <FileText size={24} color="#0284c7" />
          <div>
            <div className="mr-stat-val">{totalCount}</div>
            <div className="mr-stat-label">Total Filed</div>
          </div>
        </div>

        <div className="mr-stat-card">
          <AlertCircle size={24} color="#d97706" />
          <div>
            <div className="mr-stat-val">{pendingCount}</div>
            <div className="mr-stat-label">Pending Review</div>
          </div>
        </div>

        <div className="mr-stat-card">
          <Clock size={24} color="#2563eb" />
          <div>
            <div className="mr-stat-val">{inProgressCount}</div>
            <div className="mr-stat-label">In Progress</div>
          </div>
        </div>

        <div className="mr-stat-card">
          <CheckCircle2 size={24} color="#16a34a" />
          <div>
            <div className="mr-stat-val">{resolvedCount}</div>
            <div className="mr-stat-label">Resolved / Settled</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="my-reports-filter-bar">
        <div className="mr-search-box">
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by reference no, case type, respondent..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="mr-filter-group">
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: "13px", color: "#475569", fontWeight: 500 }}>Status:</span>
          <select
            className="mr-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved / Settled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reports Table or Empty State */}
      {reports.length === 0 && !loading ? (
        <div className="mr-empty-state">
          <div className="mr-empty-icon">
            <FileText size={28} />
          </div>
          <h3>You haven't filed any reports yet</h3>
          <p>
            When you file a report regarding community disturbances, property disputes, or local issues,
            they will appear here with live updates and timeline tracking.
          </p>
          <button
            className="btn-file-report"
            onClick={() => setIsAddModalOpen(true)}
            style={{ margin: "0 auto" }}
          >
            <PlusCircle size={18} />
            <span>File a Report Now</span>
          </button>
        </div>
      ) : (
        <div className="my-reports-table-wrap">
          <table className="my-reports-table">
            <thead>
              <tr>
                <th>Reference No.</th>
                <th>Case Type / Incident</th>
                <th>Date Filed</th>
                <th>Respondent</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((item) => (
                <tr key={item.id || item.reference_no}>
                  <td style={{ fontWeight: 600, color: "#0f172a" }}>
                    {item.reference_no || item.report_code || item.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: "#1e293b" }}>{item.caseType || item.title}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>📍 {item.purok}</div>
                  </td>
                  <td style={{ color: "#475569" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={13} color="#94a3b8" />
                      <span>{item.dateFiled || item.date_filed}</span>
                    </div>
                  </td>
                  <td style={{ color: "#475569" }}>{item.respondent || "N/A"}</td>
                  <td>{renderStatusBadge(item.status)}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn-view-report"
                      onClick={() => handleOpenDetail(item.id || item.reference_no)}
                      title="View full report and status timeline"
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mr-pagination">
            <span>
              Page {page} of {totalPages} ({totalCount} reports)
            </span>
            <div className="mr-page-btns">
              <button
                className="mr-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} style={{ verticalAlign: "middle" }} /> Prev
              </button>
              <button
                className="mr-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} style={{ verticalAlign: "middle" }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Report Modal */}
      {isAddModalOpen && (
        <AddReportModal
          onClose={() => setIsAddModalOpen(false)}
          onReportAdded={() => {
            fetchReports();
            setIsAddModalOpen(false);
          }}
        />
      )}

      {/* Section 9: Report Details Modal & Status Timeline */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div
            className="chub-modal"
            style={{ maxWidth: "620px", width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="chub-modal__close"
              onClick={() => setSelectedReport(null)}
              title="Close modal"
            >
              ✕
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>
                REPORT DETAILS
              </span>
              {renderStatusBadge(selectedReport.status)}
            </div>

            <h2 style={{ fontSize: "1.4rem", margin: "0 0 4px 0", color: "#0f172a" }}>
              {selectedReport.caseType || selectedReport.title}
            </h2>
            <div style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Ref #{selectedReport.reference_no || selectedReport.report_code || selectedReport.id} • Filed on {selectedReport.dateFiled || selectedReport.date_filed}
            </div>

            {/* Status Timeline */}
            <div className="report-timeline">
              <div className="timeline-step timeline-step--complete">
                <div className="timeline-dot">1</div>
                <div className="timeline-label">Report Filed</div>
              </div>

              <div
                className={`timeline-step ${
                  selectedReport.status?.toLowerCase().includes("progress") ||
                  selectedReport.status?.toLowerCase().includes("resolve") ||
                  selectedReport.status?.toLowerCase().includes("settle")
                    ? "timeline-step--complete"
                    : "timeline-step--active"
                }`}
              >
                <div className="timeline-dot">2</div>
                <div className="timeline-label">Lupon Review</div>
              </div>

              <div
                className={`timeline-step ${
                  selectedReport.status?.toLowerCase().includes("resolve") ||
                  selectedReport.status?.toLowerCase().includes("settle")
                    ? "timeline-step--complete"
                    : selectedReport.status?.toLowerCase().includes("reject")
                    ? "timeline-step--active"
                    : ""
                }`}
              >
                <div className="timeline-dot">3</div>
                <div className="timeline-label">
                  {selectedReport.status?.toLowerCase().includes("reject") ? "Rejected" : "Resolved"}
                </div>
              </div>
            </div>

            {/* Admin Remarks / Resolution Summary if available */}
            {(selectedReport.admin_remarks || selectedReport.resolutionSummary) && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ fontWeight: 600, color: "#166534", fontSize: "12px", display: "flex", alignItems: "center", gap: 5 }}>
                  <CheckCircle2 size={14} /> BARANGAY OFFICIAL / LUPON REMARKS:
                </div>
                <div style={{ color: "#14532d", fontSize: "13px", marginTop: "4px", lineHeight: "1.5" }}>
                  {selectedReport.admin_remarks || selectedReport.resolutionSummary}
                </div>
                {selectedReport.settleBy && (
                  <div style={{ fontSize: "11px", color: "#15803d", marginTop: 4 }}>
                    Settled by: {selectedReport.settleBy} ({selectedReport.settlementDate})
                  </div>
                )}
              </div>
            )}

            {/* Incident Summary Fields */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "12px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                fontSize: "13px",
                marginBottom: "1rem",
              }}
            >
              <div>
                <span style={{ color: "#64748b", fontSize: "11px" }}>Respondent Involved:</span>
                <div style={{ fontWeight: 600, color: "#1e293b" }}>{selectedReport.respondent || "N/A"}</div>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px" }}>Incident Location:</span>
                <div style={{ fontWeight: 600, color: "#1e293b" }}>{selectedReport.purok}</div>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px" }}>Complainant:</span>
                <div style={{ fontWeight: 600, color: "#1e293b" }}>{selectedReport.complainant}</div>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px" }}>Complainant Contact:</span>
                <div style={{ fontWeight: 600, color: "#1e293b" }}>{selectedReport.contact_number}</div>
              </div>
            </div>

            {/* Narrative / Incident Description */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                INCIDENT NARRATIVE &amp; DETAILS:
              </div>
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "13px",
                  color: "#334155",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedReport.details || selectedReport.description || "No narrative details provided."}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <button
                type="button"
                className="btn-view-report"
                style={{ padding: "8px 16px", fontSize: "13px" }}
                onClick={() => setSelectedReport(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
