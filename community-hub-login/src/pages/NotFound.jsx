import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, HelpCircle, FileText, Megaphone } from "lucide-react";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-badge">404 Error</div>
        <div className="not-found-icon">🏛️</div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-desc">
          The page or barangay service you're looking for doesn't exist, has been relocated, or is temporarily unavailable.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn-not-found-primary">
            <Home size={18} />
            <span>Return to Dashboard</span>
          </Link>
          <Link to="/announcements" className="btn-not-found-secondary">
            <Megaphone size={18} />
            <span>View Announcements</span>
          </Link>
        </div>

        <div className="not-found-help">
          <span>Need help or documents?</span>
          <div className="not-found-quick-links">
            <Link to="/request-document">
              <FileText size={14} /> Request Document
            </Link>
            <Link to="/find-friends">
              <HelpCircle size={14} /> Find Neighbors
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
