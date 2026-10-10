import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { DB } from "../../services/db";
import { User, Mail, Phone, MapPin, ShieldCheck, Edit3, Camera, FileText, BarChart3, Users, Check, X, Key } from "lucide-react";
import "./Profile.css";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [docRequests, setDocRequests] = useState([]);
  const [reportsCount, setReportsCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Password edit state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: "", success: "" });

  // Form edit state
  const [formData, setFormData] = useState({
    username: user?.username || "Juan Dela Cruz",
    email: user?.email || "juan@example.com",
    phone: user?.phone || "(072) 682-1234",
    purok: user?.purok || "Purok 3, Sta. Rita Central",
    role: user?.role || "Resident",
    avatar: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  });

  const [avatarPreview, setAvatarPreview] = useState(null);

  const refreshData = () => {
    const requests = DB.getDocumentRequests();
    setDocRequests(requests);

    const reports = DB.getReports();
    setReportsCount(reports.length);

    const residents = DB.getResidents();
    setFriendsCount(residents.filter((r) => r.isFriend).length);
  };

  useEffect(() => {
    refreshData();
    if (user) {
      setFormData({
        username: user.username || "Juan Dela Cruz",
        email: user.email || "juan@example.com",
        phone: user.phone || "(072) 682-1234",
        purok: user.purok || "Purok 3, Sta. Rita Central",
        role: user.role || "Resident",
        avatar: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      });
    }
  }, [user]);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      purok: formData.purok,
      role: formData.role,
      avatar: formData.avatar,
    };

    localStorage.setItem("chub_demo_user", JSON.stringify(updatedUser));
    if (setUser) setUser(updatedUser);
    setIsEditModalOpen(false);
    alert("Profile details updated successfully!");
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: "", success: "" });

    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({ loading: false, error: "New password must be at least 6 characters long.", success: "" });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ loading: false, error: "New passwords do not match.", success: "" });
      return;
    }

    try {
      const res = await fetch("/api/change-password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          email: user?.email || formData.email,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordStatus({ loading: false, error: "", success: "✓ Password changed successfully!" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setIsPasswordModalOpen(false), 1500);
      } else {
        setPasswordStatus({ loading: false, error: data.message || "Failed to change password.", success: "" });
      }
    } catch (err) {
      setPasswordStatus({ loading: false, error: "Cannot connect to server to change password.", success: "" });
    }
  };

  const displayName = user?.username || formData.username;
  const userRole = user?.role || formData.role;
  const avatarUrl = user?.avatar || formData.avatar;

  return (
    <div className="page profile-page">
      {/* Banner & Header */}
      <div className="profile-cover">
        <div className="profile-cover__overlay" />
      </div>

      <div className="profile-header-card">
        <div className="profile-avatar-container">
          <img src={avatarUrl} alt={displayName} className="profile-avatar-img" />
          <button
            className="profile-avatar-edit-btn"
            onClick={() => setIsEditModalOpen(true)}
            title="Change Avatar"
          >
            <Camera size={16} />
          </button>
        </div>

        <div className="profile-header-info">
          <div className="profile-name-row">
            <h1 className="profile-display-name">{displayName}</h1>
            <span className={`profile-role-badge ${userRole === "Admin" ? "badge-admin" : "badge-resident"}`}>
              <ShieldCheck size={14} /> {userRole}
            </span>
          </div>
          <p className="profile-subtext">Official Resident • Sta. Rita Central, Agoo, La Union</p>

          <div className="profile-contact-meta">
            <span><Mail size={14} /> {formData.email}</span>
            <span><Phone size={14} /> {formData.phone}</span>
            <span><MapPin size={14} /> {formData.purok}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button className="btn-edit-profile" onClick={() => setIsEditModalOpen(true)}>
            <Edit3 size={16} /> Edit Profile
          </button>
          <button className="btn-edit-profile" style={{ backgroundColor: "#334155", borderColor: "#475569" }} onClick={() => setIsPasswordModalOpen(true)}>
            <Key size={16} /> Change Password
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="profile-stats-grid">
        <div className="profile-stat-box">
          <FileText className="stat-box-icon" size={24} style={{ color: "#60a5fa" }} />
          <div>
            <div className="stat-box-num">{docRequests.length}</div>
            <div className="stat-box-label">Requested Documents</div>
          </div>
        </div>

        <div className="profile-stat-box">
          <BarChart3 className="stat-box-icon" size={24} style={{ color: "#ef4444" }} />
          <div>
            <div className="stat-box-num">{reportsCount}</div>
            <div className="stat-box-label">Filed Reports</div>
          </div>
        </div>

        <div className="profile-stat-box">
          <Users className="stat-box-icon" size={24} style={{ color: "#10b981" }} />
          <div>
            <div className="stat-box-num">{friendsCount}</div>
            <div className="stat-box-label">Community Friends</div>
          </div>
        </div>
      </div>

      {/* Profile Details & Requests History */}
      <div className="profile-content-grid">
        {/* Left Column: Account Info */}
        <div className="profile-card">
          <h3 className="profile-card-title">Personal Details</h3>
          <div className="detail-list">
            <div className="detail-item">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{displayName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Account Role</span>
              <span className="detail-value" style={{ color: userRole === "Admin" ? "#10b981" : "#60a5fa", fontWeight: 700 }}>
                {userRole}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{formData.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Contact Number</span>
              <span className="detail-value">{formData.phone}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Purok / Location</span>
              <span className="detail-value">{formData.purok}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Account Status</span>
              <span className="detail-value" style={{ color: "#34d399", fontWeight: 600 }}>
                ✓ Verified Barangay Account
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Submitted Requests History */}
        <div className="profile-card">
          <h3 className="profile-card-title">My Document Requests History</h3>

          {docRequests.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem 0" }}>
              No document requests filed yet.
            </p>
          ) : (
            <div className="profile-requests-list">
              {docRequests.slice(0, 5).map((req) => (
                <div key={req.id} className="profile-request-item">
                  <div>
                    <div style={{ fontWeight: 700, color: "#fff" }}>{req.docType}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{req.purpose} • {req.dateRequested}</div>
                  </div>
                  <span
                    className={`badge-status badge-status--${
                      req.status === "Approved" || req.status === "Accepted"
                        ? "settled"
                        : req.status === "Pending"
                        ? "pending"
                        : "unsettled"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="chub-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="chub-modal-title">✏️ Edit Profile Info</h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="modal-field">
                <label>Upload Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  style={{
                    backgroundColor: "#1e293b",
                    border: "1px dashed #475569",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    color: "#cbd5e1",
                    width: "100%",
                    cursor: "pointer"
                  }}
                />
                {avatarPreview && (
                  <div style={{ marginTop: 10, textAlign: "center" }}>
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid #3b82f6" }}
                    />
                  </div>
                )}
              </div>

              <div className="modal-field">
                <label>Display Name</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="modal-field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="modal-field">
                <label>Contact Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                />
              </div>

              <div className="modal-field">
                <label>Purok / Address</label>
                <input
                  type="text"
                  name="purok"
                  value={formData.purok}
                  onChange={handleFormChange}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="chub-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 className="chub-modal-title">🔒 Change Password</h2>
              <button onClick={() => setIsPasswordModalOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {passwordStatus.error && (
              <div style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", padding: "10px", borderRadius: "8px", fontSize: "0.9rem", marginBottom: "1rem" }}>
                ⚠️ {passwordStatus.error}
              </div>
            )}

            {passwordStatus.success && (
              <div style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34d399", padding: "10px", borderRadius: "8px", fontSize: "0.9rem", marginBottom: "1rem" }}>
                {passwordStatus.success}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit}>
              <div className="modal-field">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="modal-field">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>

              <div className="modal-field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="btn-modal-cancel" onClick={() => setIsPasswordModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit" disabled={passwordStatus.loading}>
                  {passwordStatus.loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
