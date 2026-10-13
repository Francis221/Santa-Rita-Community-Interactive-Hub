import React, { useState, useEffect } from "react";
import { UserPlus, UserCheck, Search, Users, Check, X, MessageSquare, ShieldCheck } from "lucide-react";
import { DB } from "../../services/db";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./friends.css";

export default function FindFriendsWidget({ limit = 0, showHeader = true }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [residents, setResidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const refreshResidents = async () => {
    setResidents(DB.getResidents());
    try {
      const updated = await DB.fetchUsersFromApi();
      if (updated) setResidents(updated);
    } catch (e) {}
  };

  useEffect(() => {
    refreshResidents();
    const handleUpdate = () => refreshResidents();
    window.addEventListener("friendsUpdated", handleUpdate);
    window.addEventListener("statsUpdated", handleUpdate);
    
    // Auto polling every 3 seconds for real-time online status updates
    const interval = setInterval(() => {
      refreshResidents();
    }, 3000);

    return () => {
      window.removeEventListener("friendsUpdated", handleUpdate);
      window.removeEventListener("statsUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleSendRequest = (id) => {
    DB.sendFriendRequest(id);
    refreshResidents();
  };

  const handleAcceptRequest = (id) => {
    DB.acceptFriendRequest(id);
    refreshResidents();
  };

  const handleRejectRequest = (id) => {
    DB.rejectFriendRequest(id);
    refreshResidents();
  };

  // Build complete user list including Current Logged In User
  const currentUserName = user?.username || "Juan Dela Cruz";
  const currentUserRole = user?.role || "Resident";
  const currentUserAvatar = user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";

  const isCurrentUserInDB = residents.some(
    (r) => r.name.toLowerCase() === currentUserName.toLowerCase()
  );

  const currentUserCard = {
    id: "current-logged-user",
    name: currentUserName,
    role: currentUserRole,
    purok: "Purok 1 (Sta. Rita Central)",
    avatar: currentUserAvatar,
    isFriend: false,
    status: "self",
    isOnline: true,
    isSelf: true,
  };

  let combinedList = isCurrentUserInDB
    ? residents.map((r) => {
        const isSelf =
          r.name.toLowerCase() === currentUserName.toLowerCase() ||
          (r.username && r.username.toLowerCase() === currentUserName.toLowerCase());
        return isSelf
          ? { ...r, isOnline: true, isSelf: true }
          : { ...r, isOnline: Boolean(r.isOnline), isSelf: false };
      })
    : [
        currentUserCard,
        ...residents.map((r) => ({ ...r, isOnline: Boolean(r.isOnline), isSelf: false })),
      ];

  // Filter by Tab
  let tabFiltered = combinedList;
  if (activeTab === "online") {
    tabFiltered = combinedList.filter((r) => r.isOnline || r.isSelf);
  } else if (activeTab === "requests") {
    tabFiltered = combinedList.filter((r) => r.status === "pending_incoming" || r.status === "pending_outgoing");
  } else if (activeTab === "friends") {
    tabFiltered = combinedList.filter((r) => r.isFriend);
  }

  // Filter by Search
  const searchFiltered = tabFiltered.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.purok.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayResidents = limit ? searchFiltered.slice(0, limit) : searchFiltered;

  // Real-time counts
  const totalOnline = combinedList.filter((r) => r.isOnline || r.isSelf).length;
  const totalRequests = combinedList.filter((r) => r.status === "pending_incoming").length;
  const totalFriends = combinedList.filter((r) => r.isFriend).length;

  return (
    <div className="friends-widget-card">
      {showHeader && (
        <div className="friends-widget-header">
          <div className="friends-widget-title">
            <Users size={22} style={{ color: "#38bdf8" }} />
            <div>
              <span style={{ fontSize: "1.15rem", fontWeight: 700 }}>Barangay Resident Directory &amp; Friends</span>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#94a3b8", fontWeight: 400 }}>
                {totalOnline} community members currently online
              </p>
            </div>
          </div>

          <div className="friends-search-box">
            <Search className="friends-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by name, purok or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Navigation Filter Tabs */}
      <div className="friends-tabs-bar" style={{ display: "flex", gap: "8px", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <button
          className={`friends-tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Members ({combinedList.length})
        </button>
        <button
          className={`friends-tab-btn ${activeTab === "online" ? "active" : ""}`}
          onClick={() => setActiveTab("online")}
        >
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981", marginRight: 6 }}></span>
          Online Now ({totalOnline})
        </button>
        <button
          className={`friends-tab-btn ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          Requests {totalRequests > 0 && <span className="tab-badge-count">{totalRequests}</span>}
        </button>
        <button
          className={`friends-tab-btn ${activeTab === "friends" ? "active" : ""}`}
          onClick={() => setActiveTab("friends")}
        >
          My Friends ({totalFriends})
        </button>
      </div>

      <div className="friends-grid">
        {displayResidents.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
            <Users size={40} style={{ opacity: 0.4, marginBottom: 8 }} />
            <p style={{ fontSize: "1rem", margin: 0 }}>No community members found matching your filter.</p>
          </div>
        ) : (
          displayResidents.map((resident) => {
            const isOnline = resident.isOnline || resident.isSelf;

            return (
              <div className={`friend-card ${resident.isSelf ? "friend-card--self" : ""}`} key={resident.id}>
                <div className="friend-avatar-wrapper">
                  <img src={resident.avatar} alt={resident.name} className="friend-avatar" />
                  <span
                    className={`friend-badge ${isOnline ? "friend-badge--online" : "friend-badge--offline"}`}
                    title={isOnline ? "Online Now" : "Offline"}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "nowrap", justifyContent: "center", maxWidth: "100%", overflow: "hidden" }}>
                  <h3 className="friend-name" style={{ margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{resident.name}</h3>
                  {resident.isSelf && (
                    <span className="self-tag" style={{ flexShrink: 0 }}>(You)</span>
                  )}
                </div>

                <span className="friend-role">
                  {resident.role === "Admin" ? (
                    <span style={{ color: "#10b981", fontWeight: 700 }}>
                      <ShieldCheck size={12} style={{ display: "inline", marginRight: 2 }} />
                      Barangay Admin
                    </span>
                  ) : (
                    resident.role
                  )}
                </span>

                <span className="friend-purok">📍 {resident.purok}</span>

                {/* Online Indicator Status Text */}
                <div style={{ margin: "0.2rem 0 0.8rem 0", fontSize: "0.75rem", fontWeight: 600, color: isOnline ? "#34d399" : "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: isOnline ? "#10b981" : "#64748b", display: "inline-block" }}></span>
                  {isOnline ? "Online Now" : "Offline"}
                </div>

                {/* Actions */}
                {resident.isSelf ? (
                  <button className="btn-friend-action btn-friend-self" disabled>
                    <span>🟢 Active Session</span>
                  </button>
                ) : resident.isFriend ? (
                  <button className="btn-friend-action btn-friend-friends" style={{ width: "100%" }}>
                    <UserCheck size={16} />
                    <span>Friends</span>
                  </button>
                ) : resident.status === "pending_outgoing" ? (
                  <button className="btn-friend-action btn-friend-pending" disabled>
                    <span>Request Sent</span>
                  </button>
                ) : resident.status === "pending_incoming" ? (
                  <div style={{ display: "flex", gap: "6px", width: "100%" }}>
                    <button
                      className="btn-friend-action btn-friend-accept"
                      style={{ flex: 1 }}
                      onClick={() => handleAcceptRequest(resident.id)}
                    >
                      <Check size={16} />
                      <span>Accept</span>
                    </button>
                    <button
                      className="btn-friend-action btn-friend-decline"
                      style={{ width: "38px", padding: 0 }}
                      onClick={() => handleRejectRequest(resident.id)}
                      title="Decline"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-friend-action btn-friend-add"
                    onClick={() => handleSendRequest(resident.id)}
                  >
                    <UserPlus size={16} />
                    <span>Add Friend</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
