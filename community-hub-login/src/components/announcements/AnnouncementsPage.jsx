import React, { useState, useEffect } from "react";
import { DB } from "../../services/db";
import AnnouncementCard from "./AnnouncementCard";
import AddAnnouncementModal from "./AddAnnouncementModal";
import { Megaphone, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./announcements.css";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const refreshAnnouncements = () => {
    setAnnouncements(DB.getAnnouncements());
  };

  useEffect(() => {
    refreshAnnouncements();
    DB.fetchAnnouncementsFromApi().then(data => { if (data) setAnnouncements(data); });

    const handleUpdate = () => refreshAnnouncements();
    window.addEventListener("announcementsUpdated", handleUpdate);

    const interval = setInterval(() => {
      DB.fetchAnnouncementsFromApi().then(data => { if (data) setAnnouncements(data); });
    }, 3000);

    return () => {
      window.removeEventListener("announcementsUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="page announcements-page">
      <div className="announcements-header">
        <div>
          <h1>Barangay Announcements</h1>
          <p>Official news, public notices, and community bulletins for Sta. Rita Central.</p>
        </div>

        {isAdmin && (
          <button className="btn-add-announcement" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="empty-state" style={{ textAlign: "center", padding: "3rem 1rem", background: "white", borderRadius: "12px", border: "1px dashed #cbd5e1", margin: "1.5rem 0" }}>
          <Megaphone size={48} color="#94a3b8" style={{ marginBottom: "1rem" }} />
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#1e293b" }}>No Announcements Yet</h3>
          <p style={{ color: "#64748b", margin: 0 }}>There are currently no active announcements. Check back later for community updates!</p>
        </div>
      ) : (
        <div className="announcements-grid">
          {announcements.map((item) => (
            <AnnouncementCard key={item.id} item={item} onDelete={refreshAnnouncements} />
          ))}
        </div>
      )}

      {showModal && (
        <AddAnnouncementModal onClose={() => setShowModal(false)} onAdded={refreshAnnouncements} />
      )}
    </div>
  );
}
