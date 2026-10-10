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

      <div className="announcements-grid">
        {announcements.map((item) => (
          <AnnouncementCard key={item.id} item={item} onDelete={refreshAnnouncements} />
        ))}
      </div>

      {showModal && (
        <AddAnnouncementModal onClose={() => setShowModal(false)} onAdded={refreshAnnouncements} />
      )}
    </div>
  );
}
