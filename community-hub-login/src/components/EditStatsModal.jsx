import React, { useState } from "react";
import { DB } from "../services/db";
import { X, Save } from "lucide-react";
import "./EditStatsModal.css";

export default function EditStatsModal({ onClose, onSaved }) {
  const currentStats = DB.getStats();
  const [population, setPopulation] = useState(currentStats.population || "12,480");
  const [household, setHousehold] = useState(currentStats.household || "3,150");


  const handleSubmit = (e) => {
    e.preventDefault();
    DB.updateStats({
      population: population.trim(),
      household: household.trim(),
      online: online.trim(),
    });
    if (onSaved) onSaved();
    if (onClose) onClose();
  };

  return (
    <div className="stats-modal-overlay" onClick={onClose}>
      <div className="stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stats-modal__header">
          <h3>Edit Barangay Statistics</h3>
          <button className="stats-modal__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="stats-modal__form">
          <label className="stats-modal__field">
            <span>Population</span>
            <input
              type="text"
              value={population}
              onChange={(e) => setPopulation(e.target.value)}
              placeholder="e.g. 12,480"
              required
            />
          </label>

          <label className="stats-modal__field">
            <span>Household</span>
            <input
              type="text"
              value={household}
              onChange={(e) => setHousehold(e.target.value)}
              placeholder="e.g. 3,150"
              required
            />
          </label>

          <label className="stats-modal__field">
            <span>Online Users</span>
            <input
              type="text"
              value={online}
              onChange={(e) => setOnline(e.target.value)}
              placeholder="e.g. 4"
              required
            />
          </label>

          <div className="stats-modal__actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              <Save size={16} style={{ marginRight: 6 }} /> Save Statistics
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
