import React from "react";
import { Link } from "react-router-dom";
import { Megaphone, FileText, TriangleAlert, UserPlus, Calendar, HelpCircle } from "lucide-react";
import { quickActions } from "../constants/hubConfig";
import { useAuth } from "../context/AuthContext";
import "./QuickActions.css";

const ICONS = { Megaphone, FileText, TriangleAlert, UserPlus, Calendar };

export default function QuickActions() {
  const { user } = useAuth();

  const visibleActions = quickActions.filter((action) => {
    // Only Admin role sees "File a Report" action
    if (action.id === "file-report" && user?.role !== "Admin") {
      return false;
    }
    return true;
  });

  return (
    <section className="quick-actions" aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="quick-actions__heading">
        Quick <span>Action</span>
      </h2>
      <div className="quick-actions__grid">
        {visibleActions.map((action) => {
          const Icon = ICONS[action.icon] || HelpCircle;
          return (
            <Link to={action.to} className="action-card" key={action.id}>
              <span className="action-card__icon">
                <Icon size={22} strokeWidth={1.8} />
              </span>
              <p className="action-card__title">{action.title}</p>
              <p className="action-card__subtitle">{action.subtitle}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
