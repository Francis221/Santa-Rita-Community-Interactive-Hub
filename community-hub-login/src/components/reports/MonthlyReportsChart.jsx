import React from "react";

export default function MonthlyReportsChart({ reports }) {
  // Monthly statistics data
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const filedData = [6, 9, 7, 11, 8, 7];
  const settledData = [5, 7, 6, 9, 7, 5];

  const maxVal = 12;
  const height = 150;
  const barWidth = 10;
  const gap = 24;

  const resolutionRate = 71;
  const filedCount = reports.length || 7;
  const settledCount = reports.filter((r) => r.status === "Settled").length || 5;
  const pendingCount = reports.filter((r) => r.status === "Pending").length || 2;

  return (
    <div className="monthly-card">
      <h3 className="monthly-card__title">Monthly Reports</h3>
      <p className="monthly-card__subtitle">Filed vs. settled · last 6 months</p>

      <div className="chart-container">
        <svg viewBox="0 0 340 160" width="100%" height="100%">
          {/* Grid lines */}
          <line x1="20" y1="20" x2="330" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="20" y1="60" x2="330" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="20" y1="100" x2="330" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="20" y1="140" x2="330" y2="140" stroke="rgba(255,255,255,0.1)" />

          {/* Y Axis Labels */}
          <text x="5" y="24" fill="#64748b" fontSize="10">12</text>
          <text x="5" y="64" fill="#64748b" fontSize="10">9</text>
          <text x="5" y="104" fill="#64748b" fontSize="10">6</text>
          <text x="5" y="144" fill="#64748b" fontSize="10">0</text>

          {/* Bars */}
          {months.map((month, idx) => {
            const xBase = 35 + idx * 50;
            const hFiled = (filedData[idx] / maxVal) * 120;
            const hSettled = (settledData[idx] / maxVal) * 120;

            const yFiled = 140 - hFiled;
            const ySettled = 140 - hSettled;

            return (
              <g key={month}>
                {/* Filed Bar (Purple) */}
                <rect
                  x={xBase}
                  y={yFiled}
                  width={barWidth}
                  height={hFiled}
                  rx="4"
                  fill="url(#filedGradient)"
                />
                {/* Settled Bar (Green) */}
                <rect
                  x={xBase + barWidth + 4}
                  y={ySettled}
                  width={barWidth}
                  height={hSettled}
                  rx="4"
                  fill="url(#settledGradient)"
                />
                {/* Month Label */}
                <text
                  x={xBase + barWidth}
                  y="156"
                  fill="#94a3b8"
                  fontSize="11"
                  textAnchor="middle"
                >
                  {month}
                </text>
              </g>
            );
          })}

          <defs>
            <linearGradient id="filedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="settledGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>

        <div className="chart-legend">
          <div className="chart-legend__item">
            <span className="chart-legend__dot--filed" />
            <span>Filed</span>
          </div>
          <div className="chart-legend__item">
            <span className="chart-legend__dot--settled" />
            <span>Settled</span>
          </div>
        </div>
      </div>

      <div className="resolution-box">
        <div className="resolution-box__header">SEPTEMBER 2026</div>
        <div className="resolution-rate-row">
          <span className="resolution-rate-num">{resolutionRate}%</span>
          <span className="resolution-rate-text">Resolution rate</span>
        </div>
        <div className="resolution-breakdown">
          <div>
            <div className="res-item-val">{filedCount}</div>
            <div className="res-item-lbl">Filed</div>
          </div>
          <div>
            <div className="res-item-val">{settledCount}</div>
            <div className="res-item-lbl">Settled</div>
          </div>
          <div>
            <div className="res-item-val">{pendingCount}</div>
            <div className="res-item-lbl">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
}
