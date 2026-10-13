import React, { useState } from "react";
import { DB } from "../services/db";
import { X, Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import "./EditStatsModal.css";

export default function EditStatsModal({ onClose, onSaved, currentStats = {}, csrfToken = "" }) {
  const initialStats = currentStats.population ? currentStats : DB.getStats();

  const [population, setPopulation] = useState(initialStats.population || "12,480");
  const [household, setHousehold] = useState(initialStats.household || "3,150");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Client-Side Validation: Required
    if (!population.trim() || !household.trim()) {
      setError("Both Population and Household are required fields.");
      return;
    }

    // Clean comma formatting
    const rawPop = population.replace(/,/g, "").trim();
    const rawHouse = household.replace(/,/g, "").trim();

    // 2. Client-Side Validation: Numeric and Non-Negative
    if (!/^\d+$/.test(rawPop) || parseInt(rawPop, 10) < 0) {
      setError("Population must be a valid non-negative whole number.");
      return;
    }

    if (!/^\d+$/.test(rawHouse) || parseInt(rawHouse, 10) < 0) {
      setError("Household must be a valid non-negative whole number.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 3. Save via POST/AJAX endpoint with CSRF protection and credentials
      const res = await fetch("/api/stats.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          population: rawPop,
          household: rawHouse,
          csrf_token: csrfToken,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        const errorMsg = data?.message || "Failed to update statistics in database.";
        setError(errorMsg);
        setToast({ type: "error", message: errorMsg });
        setIsSubmitting(false);
        return;
      }

      // 4. Update local cache and UI immediately without reloading
      const updatedStats = {
        population: data.stats?.population || Number(rawPop).toLocaleString(),
        household: data.stats?.household || Number(rawHouse).toLocaleString(),
      };

      DB.updateStats(updatedStats);

      setToast({
        type: "success",
        message: data.message || "Barangay statistics saved successfully!",
      });

      if (onSaved) {
        onSaved(updatedStats);
      }

      setTimeout(() => {
        if (onClose) onClose();
      }, 900);
    } catch (err) {
      const errorMsg = "Network error. Please verify backend server is online.";
      setError(errorMsg);
      setToast({ type: "error", message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stats-modal-overlay" onClick={onClose}>
      <div className="stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stats-modal__header">
          <h3>Edit Barangay Statistics</h3>
          <button className="stats-modal__close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Success or Error Toast Banner */}
        {toast && (
          <div
            style={{
              padding: "10px 16px",
              margin: "12px 16px 0",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: toast.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: toast.type === "success" ? "#34d399" : "#f87171",
              border: `1px solid ${toast.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            }}
          >
            {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toast.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="stats-modal__form">
          {error && !toast && (
            <div
              style={{
                color: "#f87171",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                padding: "8px 12px",
                borderRadius: "6px",
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <label className="stats-modal__field">
            <span>Barangay Population</span>
            <input
              type="text"
              value={population}
              onChange={(e) => {
                setPopulation(e.target.value);
                setError("");
              }}
              placeholder="e.g. 12,480"
              required
              disabled={isSubmitting}
            />
            <small style={{ color: "#94a3b8", fontSize: "11px" }}>
              Total registered residents in Sta. Rita Central
            </small>
          </label>

          <label className="stats-modal__field">
            <span>Total Households</span>
            <input
              type="text"
              value={household}
              onChange={(e) => {
                setHousehold(e.target.value);
                setError("");
              }}
              placeholder="e.g. 3,150"
              required
              disabled={isSubmitting}
            />
            <small style={{ color: "#94a3b8", fontSize: "11px" }}>
              Number of verified residential households
            </small>
          </label>

          <div className="stats-modal__actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin" style={{ marginRight: 6 }} /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} style={{ marginRight: 6 }} /> Save Statistics
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
