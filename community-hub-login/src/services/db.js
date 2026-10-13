import annImg from '../components/photo/annimg.jpg';
import cleanImg from '../components/photo/clean.jpg';
import genassembly from '../components/photo/genassembly.jpg';

export const resolveAnnouncementImage = (item) => {
  if (!item) return genassembly;
  const id = String(item.id || item.announcement_code || "");
  const title = String(item.title || "").toLowerCase();
  const rawImg = typeof item.image === "string" ? item.image : "";

  // 0. User uploaded image in uploads folder
  if (rawImg && (rawImg.includes("uploads/") || rawImg.startsWith("/api/uploads") || rawImg.startsWith("/uploads"))) {
    return rawImg.startsWith("uploads/") ? `/${rawImg}` : rawImg;
  }

  // 1. Barangay General Assembly -> genassembly.jpg
  if (
    id === "ANN-1" ||
    title.includes("general assembly") ||
    title.includes("town hall") ||
    rawImg.includes("genassembly") ||
    rawImg.includes("photo-1577962917302")
  ) {
    return genassembly;
  }

  // 2. Free Medical & Dental Mission -> annImg
  if (
    id === "ANN-2" ||
    title.includes("medical") ||
    title.includes("dental") ||
    rawImg.includes("annimg") ||
    rawImg.includes("photo-1584515979956")
  ) {
    return annImg;
  }

  // 3. Clean-Up Drive & Environmental Awareness -> cleanImg
  if (
    id === "ANN-3" ||
    title.includes("clean-up") ||
    title.includes("clean up") ||
    title.includes("environmental") ||
    rawImg.includes("clean") ||
    rawImg.includes("photo-1532996122724")
  ) {
    return cleanImg;
  }

  // Remove any external URL links (e.g. Unsplash or HTTP links) in announcements
  if (rawImg.includes("unsplash.com") || rawImg.startsWith("http://") || rawImg.startsWith("https://")) {
    return genassembly;
  }

  // 4. Custom user uploaded photo (e.g. data:image/... base64)
  if (rawImg && rawImg.trim().length > 0) {
    return rawImg;
  }

  return genassembly;
};

export const resolveEventImage = (item) => {
  if (!item) return annImg;
  const id = String(item.id || "");
  const title = String(item.title || "").toLowerCase();
  const category = String(item.category || "").toLowerCase();
  const rawImg = typeof item.image === "string" ? item.image : "";

  // 1. Senior Citizens Wellness Checkup & Pension Payout (Senior Affairs) -> annImg
  if (
    id === "EVT-2" ||
    title.includes("senior citizens") ||
    title.includes("wellness checkup") ||
    title.includes("pension payout") ||
    category.includes("senior affairs") ||
    rawImg.includes("annimg") ||
    rawImg.includes("photo-1576765608535")
  ) {
    return annImg;
  }

  // 2. Disaster Preparedness & Fire Safety Drill (Safety) -> cleanImg
  if (
    id === "EVT-3" ||
    title.includes("disaster") ||
    title.includes("fire safety") ||
    category.includes("safety") ||
    rawImg.includes("clean") ||
    rawImg.includes("photo-1509099836639")
  ) {
    return cleanImg;
  }

  // If rawImg is a valid non-stale custom image
  if (rawImg && rawImg.trim().length > 0 && !rawImg.includes("unsplash.com/photo-1576765608535") && !rawImg.includes("unsplash.com/photo-1509099836639")) {
    return rawImg;
  }

  return item.image || annImg;
};


const STORAGE_KEYS = {
  REPORTS: "chub_db_reports",
  DOC_REQUESTS: "chub_db_doc_requests",
  CURRENT_USER: "chub_db_user",
  STATS: "chub_db_stats",
  ANNOUNCEMENTS: "chub_db_announcements",
  EVENTS: "chub_db_events",
  RESIDENTS: "chub_db_residents",
};

// Proactively update any cached announcements in localStorage with the true images
try {
  const cachedData = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS) : null;
  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const cleaned = parsed.map((item) => ({
        ...item,
        image: resolveAnnouncementImage(item),
      }));
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(cleaned));
    }
  }
} catch (e) { }

// Proactively update any cached events in localStorage with the true images
try {
  const cachedEvents = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.EVENTS) : null;
  if (cachedEvents) {
    const parsed = JSON.parse(cachedEvents);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const cleaned = parsed.map((item) => ({
        ...item,
        image: resolveEventImage(item),
      }));
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(cleaned));
    }
  }
} catch (e) { }

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
    image: genassembly,
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
    image: annImg,
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
    image: cleanImg,
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
    } catch (e) { }
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
      if (!Array.isArray(list) || list.length === 0) {
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
        return INITIAL_ANNOUNCEMENTS;
      }
      return list.map((item) => {
        return { ...item, image: resolveAnnouncementImage(item) };
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
          const mapped = data.announcements.map((item) => ({
            ...item,
            image: resolveAnnouncementImage(item)
          }));
          localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(mapped));
          window.dispatchEvent(new Event("announcementsUpdated"));
          return mapped;
        }
      }
    } catch (e) { }
    return DB.getAnnouncements();
  },

  addAnnouncement: async (announcementData, fallbackObj) => {
    const isFormData = announcementData instanceof FormData;
    const items = DB.getAnnouncements();

    const title = isFormData ? announcementData.get("title") : announcementData.title;
    const category = isFormData ? announcementData.get("category") : (announcementData.category || "General");
    const badge = isFormData ? announcementData.get("badge") : (announcementData.badge || "Notice");
    const location = isFormData ? announcementData.get("location") : (announcementData.location || "Barangay Hall");
    const content = isFormData ? announcementData.get("content") : (announcementData.content || "");
    const imagePreview = fallbackObj?.imagePreview || genassembly;

    const newItem = {
      id: `ANN-${Date.now()}`,
      title,
      category,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      time: "9:00 AM",
      location,
      author: "Barangay Admin",
      content,
      badge,
      image: imagePreview,
    };

    const updated = [newItem, ...items];
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("announcementsUpdated"));

    try {
      const res = await fetch('/api/announcements.php?action=create', {
        method: 'POST',
        credentials: 'include',
        body: isFormData ? announcementData : JSON.stringify(newItem)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.announcement) {
          await DB.fetchAnnouncementsFromApi();
        }
      }
    } catch (e) { }

    return newItem;
  },

  updateAnnouncement: async (announcementData, fallbackObj) => {
    const isFormData = announcementData instanceof FormData;
    const id = isFormData ? announcementData.get("id") : announcementData.id;
    const items = DB.getAnnouncements();

    const title = isFormData ? announcementData.get("title") : announcementData.title;
    const category = isFormData ? announcementData.get("category") : announcementData.category;
    const badge = isFormData ? announcementData.get("badge") : announcementData.badge;
    const location = isFormData ? announcementData.get("location") : announcementData.location;
    const content = isFormData ? announcementData.get("content") : announcementData.content;
    const imagePreview = fallbackObj?.imagePreview;

    const updated = items.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          title: title || a.title,
          category: category || a.category,
          badge: badge || a.badge,
          location: location || a.location,
          content: content || a.content,
          image: imagePreview || a.image
        };
      }
      return a;
    });

    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("announcementsUpdated"));

    try {
      const res = await fetch('/api/announcements.php?action=update', {
        method: 'POST',
        credentials: 'include',
        body: isFormData ? announcementData : JSON.stringify({ id, title, category, badge, location, content })
      });
      if (res.ok) {
        await DB.fetchAnnouncementsFromApi();
      }
    } catch (e) { }

    return updated;
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
      }).catch(() => { });
    } catch (e) { }

    return updated;
  },

  // Events API
  fetchEventsFromApi: async () => {
    try {
      const res = await fetch('/api/events.php?action=list', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.events) && data.events.length > 0) {
          localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events));
          window.dispatchEvent(new Event("eventsUpdated"));
          return data.events;
        }
      }
    } catch (e) {}
    return DB.getEvents();
  },

  getEvents: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
        return INITIAL_EVENTS;
      }
      const list = JSON.parse(data);
      if (!Array.isArray(list) || list.length === 0) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
        return INITIAL_EVENTS;
      }
      return list.map((item) => ({
        ...item,
        image: resolveEventImage(item),
      }));
    } catch (e) {
      return INITIAL_EVENTS;
    }
  },

  addEvent: async (event) => {
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

    try {
      const formData = new FormData();
      formData.append("title", event.title);
      formData.append("category", event.category || "Community");
      formData.append("date", event.date || "");
      formData.append("start_time", event.time || "9:00 AM");
      formData.append("location", event.location || "Barangay Plaza");
      formData.append("organizer", event.organizer || "Barangay Council");
      formData.append("description", event.description || "");
      await fetch('/api/events.php?action=create', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      await DB.fetchEventsFromApi();
    } catch (e) {}

    return newItem;
  },

  deleteEvent: (id) => {
    const items = DB.getEvents();
    const updated = items.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("eventsUpdated"));

    try {
      fetch('/api/events.php?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      }).catch(() => {});
    } catch (e) {}

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
      const [resUsers, resFriends] = await Promise.all([
        fetch('/api/users.php', { credentials: 'include' }).catch(() => null),
        fetch('/api/friends.php?action=list', { credentials: 'include' }).catch(() => null)
      ]);

      if (resUsers && resUsers.ok) {
        const data = await resUsers.json();
        let friendsData = { friends: [], incoming: [], outgoing: [] };
        if (resFriends && resFriends.ok) {
          try {
            const fJson = await resFriends.json();
            if (fJson && fJson.success) friendsData = fJson;
          } catch (e) { }
        }

        if (data && data.success && Array.isArray(data.users)) {
          const currentResidents = DB.getResidents();

          // Construct resident list strictly from MySQL database users and backend friend status
          const updated = data.users.map((u) => {
            const uIdNum = Number(u.id);
            const uNameLower = (u.username || "").toLowerCase();
            const existing = currentResidents.find(
              (r) =>
                (r.username && r.username.toLowerCase() === uNameLower) ||
                (r.name && r.name.toLowerCase() === uNameLower) ||
                r.id === `user-${u.id}`
            );
            const isDbOnline = Boolean(u.is_online);

            let isFriend = friendsData.friends?.includes(uIdNum) || false;
            let status = 'none';

            if (isFriend) {
              status = 'accepted';
            } else if (friendsData.incoming?.includes(uIdNum)) {
              status = 'pending_incoming';
            } else if (friendsData.outgoing?.includes(uIdNum)) {
              status = 'pending_outgoing';
            } else if (existing?.status && existing.status !== 'self') {
              status = existing.status;
              isFriend = existing.isFriend;
            } else {
              // Defaults for known accepted users
              if (uNameLower === "justinryan" || uNameLower === "admin" || uNameLower === "kyla") {
                isFriend = true;
                status = "accepted";
              }
            }

            return {
              id: `user-${u.id}`,
              name: u.username,
              username: u.username,
              email: u.email || (existing ? existing.email : ""),
              role: u.role || (existing ? existing.role : "Resident"),
              purok: existing ? existing.purok : "Purok 1 (Sta. Rita Central)",
              avatar: u.avatar || (existing ? existing.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"),
              isFriend: isFriend,
              status: status,
              isOnline: isDbOnline,
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

    const friendId = id?.replace?.("user-", "");
    try {
      fetch('/api/friends.php?action=send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friend_id: friendId })
      }).catch(() => { });
    } catch (e) { }

    return updated;
  },

  acceptFriendRequest: (id) => {
    const residents = DB.getResidents();
    const updated = residents.map((r) => (r.id === id ? { ...r, isFriend: true, status: "accepted" } : r));
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("friendsUpdated"));

    const friendId = id?.replace?.("user-", "");
    try {
      fetch('/api/friends.php?action=accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friend_id: friendId })
      }).catch(() => { });
    } catch (e) { }

    return updated;
  },

  rejectFriendRequest: (id) => {
    const residents = DB.getResidents();
    const updated = residents.map((r) => (r.id === id ? { ...r, isFriend: false, status: "none" } : r));
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("friendsUpdated"));

    const friendId = id?.replace?.("user-", "");
    try {
      fetch('/api/friends.php?action=reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friend_id: friendId })
      }).catch(() => { });
    } catch (e) { }

    return updated;
  },

  getPendingFriendRequestsCount: () => {
    const residents = DB.getResidents();
    return residents.filter((r) => r.status === "pending_incoming").length;
  },

  getOnlineCount: () => {
    const residents = DB.getResidents();
    const count = residents.filter((r) => Boolean(r.isOnline)).length;
    return count;
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

  // Reports API: Retrieve list of incident reports from local cache
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

  // Reports API: Fetch reports from backend API and merge with locally cached reports to avoid losing data
  fetchReportsFromApi: async () => {
    try {
      const res = await fetch('/api/reports.php', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.reports)) {
          const localReports = DB.getReports();
          // Smart merge: keep any local reports that are not yet in the API response
          const apiIds = new Set(data.reports.map(r => r.id));
          const unsynced = localReports.filter(lr => lr.id && !apiIds.has(lr.id));
          const merged = [...unsynced, ...data.reports];
          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(merged));
          window.dispatchEvent(new Event("reportsUpdated"));
          return merged;
        }
      }
    } catch (e) {
      // Backend offline or spinning up; continue serving local reports
    }
    return DB.getReports();
  },

  // Reports API: Add a new community case report (saves to localStorage immediately and syncs with backend API)
  addReport: async (newReport) => {
    const reports = DB.getReports();
    const generatedId = newReport.id || `REP-2026-${String(reports.length + 1).padStart(3, "0")}`;
    const formattedReport = {
      id: generatedId,
      title: newReport.caseType || newReport.title || "Incident Report",
      caseType: newReport.caseType || newReport.title || "General Report",
      complainant: newReport.complainant || "Anonymous",
      respondent: newReport.respondent || "N/A",
      parties: `${newReport.complainant || "Anonymous"} vs. ${newReport.respondent || "N/A"}`,
      status: newReport.status || "Pending",
      dateFiled: newReport.dateFiled || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      purok: newReport.purok || "Purok 1",
      details: newReport.details || newReport.description || "",
      description: newReport.details || newReport.description || "",
      settlementDate: newReport.settlementDate || "",
      settleBy: newReport.settleBy || "",
      resolutionSummary: newReport.resolutionSummary || "",
    };

    // Save locally first for instant, guaranteed availability
    const updated = [formattedReport, ...reports];
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
    window.dispatchEvent(new Event("reportsUpdated"));

    // Sync to backend PHP/MySQL or SQLite API
    try {
      const res = await fetch('/api/reports.php?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formattedReport)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.report) {
          const current = DB.getReports();
          const synced = current.map(r => r.id === formattedReport.id ? { ...r, ...data.report } : r);
          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(synced));
          window.dispatchEvent(new Event("reportsUpdated"));
        }
      }
    } catch (e) {
      console.warn("Could not sync report to backend API (stored safely in local storage):", e);
    }

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
      }).catch(() => { });
    } catch (e) { }

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
      }).catch(() => { });
    } catch (e) { }

    return filtered;
  },

  // Document Requests API: Retrieve document requests from local cache
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

  // Document Requests API: Fetch from backend and merge with locally cached requests to avoid data loss
  fetchDocumentRequestsFromApi: async () => {
    try {
      const res = await fetch('/api/requests.php', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.requests)) {
          const localRequests = DB.getDocumentRequests();
          const apiIds = new Set(data.requests.map(r => r.id));
          const unsynced = localRequests.filter(lr => lr.id && !apiIds.has(lr.id));
          const merged = [...unsynced, ...data.requests];
          localStorage.setItem(STORAGE_KEYS.DOC_REQUESTS, JSON.stringify(merged));
          window.dispatchEvent(new Event("docRequestsUpdated"));
          return merged;
        }
      }
    } catch (e) {
      // Backend offline or spinning up; retain local requests
    }
    return DB.getDocumentRequests();
  },

  // Document Requests API: Add a new document request
  addDocumentRequest: async (newRequest) => {
    const requests = DB.getDocumentRequests();
    const formatted = {
      id: newRequest.id || `DOC-2026-${String(requests.length + 101).padStart(3, "0")}`,
      applicantName: (newRequest.applicantName || "FRANCIS REGIE DE GUZMAN").toUpperCase(),
      docType: newRequest.docType || "BARANGAY CLEARANCE",
      documentName: newRequest.documentName || "Barangay Clearance",
      status: newRequest.status || "Pending",
      dateRequested: newRequest.dateRequested || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
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
      const res = await fetch('/api/requests.php?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formatted)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.request) {
          const current = DB.getDocumentRequests();
          const synced = current.map(r => r.id === formatted.id ? { ...r, ...data.request } : r);
          localStorage.setItem(STORAGE_KEYS.DOC_REQUESTS, JSON.stringify(synced));
          window.dispatchEvent(new Event("docRequestsUpdated"));
        }
      }
    } catch (e) {
      console.warn("Could not sync doc request to backend API (stored safely in local storage):", e);
    }

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
      }).catch(() => { });
    } catch (e) { }

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
