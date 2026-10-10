
import annImg from '../components/photo/annimg.jpg';
import cleanImg from '../components/photo/clean.jpg';

const STORAGE_KEYS = {
  REPORTS: "chub_db_reports",
  DOC_REQUESTS: "chub_db_doc_requests",
  CURRENT_USER: "chub_db_user",
  STATS: "chub_db_stats",
  ANNOUNCEMENTS: "chub_db_announcements",
  EVENTS: "chub_db_events",
  RESIDENTS: "chub_db_residents",
};

const DEFAULT_STATS = {
  population: "12,480",
  household: "3,150",
  online: "1",
};

const DEFAULT_USER = {
  name: "Juan Dela Cruz",
  role: "Admin",
  initials: "JD",
  barangay: "Sta. Rita Central",
};

const INITIAL_ANNOUNCEMENTS = [
  {
    id: "ANN-1",
    title: "Barangay General Assembly & Town Hall",
    category: "Official Assembly",
    date: "Oct 10, 2026",
    time: "9:00 AM",
    location: "Barangay Sta. Rita Central Gymnasium",
    author: "Barangay Council",
    content: "All residents of Sta. Rita Central are invited to attend the quarterly General Assembly to discuss upcoming community infrastructure programs, security measures, and public health updates.",
    badge: "Important",
    image: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "ANN-2",
    title: "Free Medical & Dental Mission",
    category: "Health & Wellness",
    date: "Oct 15, 2026",
    time: "8:00 AM - 3:00 PM",
    location: "Barangay Health Center",
    author: "Committee on Health",
    content: "Free checkups, dental extractions, and basic prescription medicines will be provided to registered residents. Please bring a valid Barangay ID or Certificate of Residency.",
    badge: "Public Service",
    image: annImg,
  },
  {
    id: "ANN-3",
    title: "Clean-Up Drive & Environmental Awareness",
    category: "Environment",
    date: "Oct 20, 2026",
    time: "6:00 AM",
    location: "Purok 1 to Purok 5 Coastal Area",
    author: "SK Youth Council",
    content: "Join our monthly coastal & street clean-up drive. Cleaning tools, gloves, and refreshments will be provided for all volunteers.",
    badge: "Volunteer",
    image: cleanImg,
  },
];

const INITIAL_EVENTS = [
  {
    id: "EVT-1",
    title: "SK Youth Basketball & Volleyball League",
    category: "Sports",
    date: "Oct 12, 2026",
    time: "4:00 PM",
    location: "Sta. Rita Covered Court",
    organizer: "SK Youth Council",
    description: "Annual Barangay Inter-Purok Sports League kick-off ceremony. Cheer for your purok teams!",
    attendeesCount: 42,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "EVT-2",
    title: "Senior Citizens Wellness Checkup & Pension Payout",
    category: "Senior Affairs",
    date: "Oct 18, 2026",
    time: "9:00 AM",
    location: "Barangay Multipurpose Hall",
    organizer: "Office for Senior Citizens Affairs",
    description: "Monthly social pension payout and free blood pressure & glucose screening for seniors.",
    attendeesCount: 88,
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "EVT-3",
    title: "Disaster Preparedness & Fire Safety Drill",
    category: "Safety",
    date: "Oct 25, 2026",
    time: "1:30 PM",
    location: "Barangay Plaza",
    organizer: "BFP & Barangay Tanod Unit",
    description: "Hands-on fire extinguisher usage demonstration, earthquake drill, and emergency kit prep tutorial.",
    attendeesCount: 65,
    image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&auto=format&fit=crop&q=80",
  },
];

const INITIAL_RESIDENTS = [
  {
    id: "user-2",
    name: "Justin Ryan",
    username: "justinryan",
    email: "deguzmanfrancis50@gmail.com",
    role: "Resident",
    purok: "Purok 2 (Sta. Rita Central)",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    isFriend: true,
    status: "accepted",
    isOnline: false,
  },
  {
    id: "user-1",
    name: "Francis De Guzman",
    username: "francis",
    email: "francis@example.com",
    role: "Admin",
    purok: "Purok 1 (Sta. Rita Central)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    isFriend: true,
    status: "accepted",
    isOnline: false,
  },
  {
    id: "user-3",
    name: "Admin User",
    username: "admin",
    email: "admin@barangay.gov.ph",
    role: "Admin",
    purok: "Purok 1 (Sta. Rita Central)",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    isFriend: true,
    status: "accepted",
    isOnline: false,
  },
  {
    id: "user-5",
    name: "Kyla Movido",
    username: "kyla",
    email: "kylamovido5@gmail.com",
    role: "Resident",
    purok: "Purok 3 (Sta. Rita Central)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    isFriend: false,
    status: "none",
    isOnline: false,
  },
  {
    id: "user-4",
    name: "Test Resident",
    username: "testresident",
    email: "testresident@example.com",
    role: "Resident",
    purok: "Purok 4 (Sta. Rita Central)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    isFriend: false,
    status: "none",
    isOnline: false,
  },
];

export const DB = {
  // Statistics API
  getStats: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(DEFAULT_STATS));
        return DEFAULT_STATS;
      }
      return { ...DEFAULT_STATS, ...JSON.parse(data) };
    } catch (e) {
      return DEFAULT_STATS;
    }
  },

  updateStats: (newStats) => {
    const current = DB.getStats();
    const updated = { ...current, ...newStats };
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
    window.dispatchEvent(new Event("statsUpdated"));
    return updated;
  },

  fetchLoginLogsSummary: async () => {
    try {
      const res = await fetch('/api/login-logs.php?action=summary', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.stats) {
          return data.stats;
        }
      }
    } catch (e) {}
    return null;
  },

  // Announcements API
  getAnnouncements: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
        return INITIAL_ANNOUNCEMENTS;
      }
      const list = JSON.parse(data);
      return list.map((item) => {
        let img = item.image;
        if (img && (img.includes("annimg.jpg") || img === "./src/components/photo/annimg.jpg")) {
          img = annImg;
        } else if (img && (img.includes("clean.jpg") || img === "./src/components/photo/clean.jpg")) {
          img = cleanImg;
        }
        return { ...item, image: img };
      });
    } catch (e) {
      return INITIAL_ANNOUNCEMENTS;
    }
  },

  fetchAnnouncementsFromApi: async () => {
    try {
      const res = await fetch('/api/announcements.php', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.announcements) && data.announcements.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(data.announcements));
          window.dispatchEvent(new Event("announcementsUpdated"));
          return data.announcements;
        }
      }
    } catch (e) {}
    return DB.getAnnouncements();
  },

  addAnnouncement: (announcement) => {
    const items = DB.getAnnouncements();
    const newItem = {
      id: `ANN-${Date.now()}`,
      title: announcement.title,
      category: announcement.category || "General",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      time: announcement.time || "9:00 AM",
      location: announcement.location || "Barangay Hall",
      author: announcement.author || "Barangay Admin",
      content: announcement.content || "",
      badge: announcement.badge || "Notice",
      image: announcement.image || "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&auto=format&fit=crop&q=80",
    };
    const updated = [newItem, ...items];
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("announcementsUpdated"));

    try {
      fetch('/api/announcements.php?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newItem)
      }).catch(() => {});
    } catch (e) {}

    return newItem;
  },

  deleteAnnouncement: (id) => {
    const items = DB.getAnnouncements();
    const updated = items.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("announcementsUpdated"));

    try {
      fetch('/api/announcements.php?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      }).catch(() => {});
    } catch (e) {}

    return updated;
  },

  // Events API
  getEvents: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
        return INITIAL_EVENTS;
      }
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_EVENTS;
    }
  },

  addEvent: (event) => {
    const items = DB.getEvents();
    const newItem = {
      id: `EVT-${Date.now()}`,
      title: event.title,
      category: event.category || "Community Event",
      date: event.date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      time: event.time || "10:00 AM",
      location: event.location || "Barangay Plaza",
      organizer: event.organizer || "Community Committee",
      description: event.description || "",
      attendeesCount: 1,
      image: event.image || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    };
    const updated = [newItem, ...items];
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("eventsUpdated"));
    return newItem;
  },

  deleteEvent: (id) => {
    const items = DB.getEvents();
    const updated = items.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("eventsUpdated"));
    return updated;
  },

  // Find Friends & Residents API
  getResidents: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESIDENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(INITIAL_RESIDENTS));
        return INITIAL_RESIDENTS;
      }
      const parsed = JSON.parse(data);
      // Clean up legacy non-database users if present
      const knownUsernames = ["justinryan", "admin", "francis", "kyla", "testresident"];
      const cleaned = parsed.filter((r) => {
        const uName = (r.username || r.name || "").toLowerCase().replace(/\s+/g, "");
        return knownUsernames.some(k => uName.includes(k) || k.includes(uName)) || r.id?.startsWith("user-");
      });

      return cleaned.length > 0 ? cleaned : INITIAL_RESIDENTS;
    } catch (e) {
      return INITIAL_RESIDENTS;
    }
  },

  addResident: (residentData) => {
    const residents = DB.getResidents();
    const name = residentData.name || residentData.username || "New Resident";
    const exists = residents.some(r => r.name.toLowerCase() === name.toLowerCase());
    if (exists) return residents;

    const newRes = {
      id: `user-${Date.now()}`,
      name: name,
      username: residentData.username || name.toLowerCase().replace(/\s+/g, ""),
      role: residentData.role || "Resident",
      purok: residentData.purok || "Purok 1 (Sta. Rita Central)",
      avatar: residentData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      isFriend: false,
      status: "none",
      isOnline: false,
      isToggledOnline: false,
    };
    const updated = [newRes, ...residents];
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("friendsUpdated"));
    window.dispatchEvent(new Event("statsUpdated"));
    return updated;
  },

  fetchUsersFromApi: async () => {
    try {
      const res = await fetch('/api/users.php', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.users)) {
          const currentResidents = DB.getResidents();
          
          // Construct resident list strictly from MySQL database users
          const updated = data.users.map((u) => {
            const uNameLower = (u.username || "").toLowerCase();
            const existing = currentResidents.find(
              (r) =>
                (r.username && r.username.toLowerCase() === uNameLower) ||
                (r.name && r.name.toLowerCase() === uNameLower) ||
                r.id === `user-${u.id}`
            );
            const isDbOnline = Boolean(u.is_online);
            const isToggled = existing ? Boolean(existing.isToggledOnline) : false;
            return {
              id: `user-${u.id}`,
              name: u.username,
              username: u.username,
              email: u.email || (existing ? existing.email : ""),
              role: u.role || (existing ? existing.role : "Resident"),
              purok: existing ? existing.purok : "Purok 1 (Sta. Rita Central)",
              avatar: u.avatar || (existing ? existing.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"),
              isFriend: existing ? existing.isFriend : (u.username?.toLowerCase() === "justinryan" || u.username?.toLowerCase() === "admin" || u.username?.toLowerCase() === "francis"),
              status: existing ? existing.status : (u.username?.toLowerCase() === "justinryan" || u.username?.toLowerCase() === "admin" || u.username?.toLowerCase() === "francis" ? "accepted" : "none"),
              isOnline: isDbOnline || isToggled,
              isToggledOnline: isToggled,
            };
          });

          localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(updated));
          window.dispatchEvent(new Event("friendsUpdated"));
          window.dispatchEvent(new Event("statsUpdated"));
          return updated;
        }
      }
    } catch (e) {
      console.warn("Could not fetch API users:", e);
    }
    return DB.getResidents();
  },

  sendFriendRequest: (id) => {
    const residents = DB.getResidents();
    const updated = residents.map((r) => (r.id === id ? { ...r, status: "pending_outgoing" } : r));
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("friendsUpdated"));
    return updated;
  },

  acceptFriendRequest: (id) => {
    const residents = DB.getResidents();
    const updated = residents.map((r) => (r.id === id ? { ...r, isFriend: true, status: "accepted" } : r));
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("friendsUpdated"));
    return updated;
  },

  rejectFriendRequest: (id) => {
    const residents = DB.getResidents();
    const updated = residents.map((r) => (r.id === id ? { ...r, isFriend: false, status: "none" } : r));
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("friendsUpdated"));
    return updated;
  },

  getPendingFriendRequestsCount: () => {
    const residents = DB.getResidents();
    return residents.filter((r) => r.status === "pending_incoming").length;
  },

  getOnlineCount: () => {
    const residents = DB.getResidents();
    const count = residents.filter((r) => Boolean(r.isOnline || r.isToggledOnline)).length;
    return Math.max(1, count);
  },

  toggleResidentOnline: (id) => {
    const residents = DB.getResidents();
    const updated = residents.map((r) =>
      r.id === id ? { ...r, isOnline: !r.isOnline, isToggledOnline: !r.isOnline } : r
    );
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("friendsUpdated"));
    window.dispatchEvent(new Event("statsUpdated"));
    return updated;
  },

  // Reports API
  getReports: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  fetchReportsFromApi: async () => {
    try {
      const res = await fetch('/api/reports.php', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.reports)) {
          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(data.reports));
          window.dispatchEvent(new Event("reportsUpdated"));
          return data.reports;
        }
      }
    } catch (e) {}
    return DB.getReports();
  },

  addReport: (newReport) => {
    const reports = DB.getReports();
    const formattedReport = {
      id: `REP-2026-${String(reports.length + 1).padStart(3, "0")}`,
      title: newReport.caseType || newReport.title || "Incident Report",
      caseType: newReport.caseType || "General Report",
      complainant: newReport.complainant || "Anonymous",
      respondent: newReport.respondent || "N/A",
      parties: `${newReport.complainant || "Anonymous"} vs. ${newReport.respondent || "N/A"}`,
      status: newReport.status || "Pending",
      dateFiled: newReport.dateFiled || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      purok: newReport.purok || "Purok 1",
      description: newReport.details || newReport.description || "",
      settlementDate: "",
      settleBy: "",
      resolutionSummary: "",
    };

    const updated = [formattedReport, ...reports];
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("reportsUpdated"));

    try {
      fetch('/api/reports.php?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formattedReport)
      }).catch(() => {});
    } catch (e) {}

    return formattedReport;
  },

  updateReport: (id, updatedFields) => {
    const reports = DB.getReports();
    const updated = reports.map((rep) => {
      if (rep.id === id || rep.title === id) {
        const complainant = updatedFields.complainant || rep.complainant;
        const respondent = updatedFields.respondent || rep.respondent;
        return {
          ...rep,
          ...updatedFields,
          parties: `${complainant} vs. ${respondent}`,
          title: updatedFields.caseType || rep.caseType || rep.title,
        };
      }
      return rep;
    });
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("reportsUpdated"));
    return updated;
  },

  settleReport: (id, settlementData) => {
    const reports = DB.getReports();
    const updated = reports.map((rep) => {
      if (rep.id === id || rep.title === id) {
        return {
          ...rep,
          status: "Settled",
          settlementDate: settlementData.settlementDate || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
          settleBy: settlementData.settleBy || "Admin",
          resolutionSummary: settlementData.resolutionSummary || "Settled by mutual agreement.",
        };
      }
      return rep;
    });
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("reportsUpdated"));

    try {
      fetch('/api/reports.php?action=settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, ...settlementData })
      }).catch(() => {});
    } catch (e) {}

    return updated;
  },

  deleteReport: (id) => {
    const reports = DB.getReports();
    const filtered = reports.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(filtered));
    window.dispatchEvent(new Event("reportsUpdated"));

    try {
      fetch('/api/reports.php?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      }).catch(() => {});
    } catch (e) {}

    return filtered;
  },

  // Document Requests API
  getDocumentRequests: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOC_REQUESTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.DOC_REQUESTS, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  fetchDocumentRequestsFromApi: async () => {
    try {
      const res = await fetch('/api/requests.php', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.requests)) {
          localStorage.setItem(STORAGE_KEYS.DOC_REQUESTS, JSON.stringify(data.requests));
          window.dispatchEvent(new Event("docRequestsUpdated"));
          return data.requests;
        }
      }
    } catch (e) {}
    return DB.getDocumentRequests();
  },

  addDocumentRequest: (newRequest) => {
    const requests = DB.getDocumentRequests();
    const formatted = {
      id: `DOC-2026-${String(requests.length + 101).padStart(3, "0")}`,
      applicantName: (newRequest.applicantName || "FRANCIS REGIE DE GUZMAN").toUpperCase(),
      docType: newRequest.docType || "BARANGAY CLEARANCE",
      documentName: newRequest.documentName || "Barangay Clearance",
      status: newRequest.status || "Pending",
      dateRequested: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      timeAgo: "Just now",
      address: newRequest.address || "Purok 3, Sta. Rita Central, Agoo, La Union",
      civilStatus: newRequest.civilStatus || "Single",
      age: newRequest.age || 25,
      purpose: newRequest.purpose || "General Purpose",
      ctcNo: newRequest.ctcNo || `CTC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      orNo: newRequest.orNo || `OR-${Math.floor(90000 + Math.random() * 9000)}`,
    };

    const updated = [formatted, ...requests];
    localStorage.setItem(STORAGE_KEYS.DOC_REQUESTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("docRequestsUpdated"));

    try {
      fetch('/api/requests.php?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formatted)
      }).catch(() => {});
    } catch (e) {}

    return formatted;
  },

  updateDocumentStatus: (id, status) => {
    const requests = DB.getDocumentRequests();
    const updated = requests.map((doc) => (doc.id === id ? { ...doc, status } : doc));
    localStorage.setItem(STORAGE_KEYS.DOC_REQUESTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("docRequestsUpdated"));

    try {
      fetch('/api/requests.php?action=update_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, status })
      }).catch(() => {});
    } catch (e) {}

    return updated;
  },

  deleteDocumentRequest: (id) => {
    const requests = DB.getDocumentRequests();
    const filtered = requests.filter((doc) => doc.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOC_REQUESTS, JSON.stringify(filtered));
    window.dispatchEvent(new Event("docRequestsUpdated"));
    return filtered;
  },

  // User session
  getUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USER));
        return DEFAULT_USER;
      }
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_USER;
    }
  },

  setUserRole: (role) => {
    const user = DB.getUser();
    const updated = { ...user, role };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
    window.dispatchEvent(new Event("roleChange"));
    return updated;
  }
};
