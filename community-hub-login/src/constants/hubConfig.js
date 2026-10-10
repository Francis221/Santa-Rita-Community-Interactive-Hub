// Barangay System Configuration and Navigation Structure

export const barangay = {
  name: "Sta. Rita Central",
  municipality: "Agoo, La Union",
  email: "barangay@sta-rita.gov.ph",
  phone: "0912 345 6789",
  address: "Barangay Hall, Agoo, La Union",
  photo: './src/components/photo/logostarita.jpg'
};

export const stats = [
  { id: "population", label: "Population", value: "12,480", icon: "Users" },
  { id: "household", label: "Household", value: "3,150", icon: "Home" },
  { id: "online", label: "Online", value: "1", icon: "Globe" },
  { id: "reports", label: "Active Reports", value: "0", icon: "AlertCircle", tone: "red" },
];

export const quickActions = [
  {
    id: "announcements",
    title: "Announcements",
    subtitle: "Latest news & bulletins",
    icon: "Megaphone",
    to: "/announcements",
  },
  {
    id: "find-friends",
    title: "Find Friends",
    subtitle: "Connect with neighbors",
    icon: "UserPlus",
    to: "/find-friends",
  },
  {
    id: "events",
    title: "Barangay Events",
    subtitle: "Community calendar",
    icon: "Calendar",
    to: "/events",
  },
  {
    id: "request-docs",
    title: "Request Docs",
    subtitle: "Clearance & more",
    icon: "FileText",
    to: "/request-document",
  },
  {
    id: "file-report",
    title: "File a Report",
    subtitle: "Incidents & issues",
    icon: "TriangleAlert",
    to: "/reports",
  },
];

export const hotlines = [
  { id: "national", label: "National Emergency", number: "911" },
  { id: "hall", label: "Barangay Hall", number: "(072) 682-8899" },
  { id: "police", label: "Police Station", number: "(072) 682-1122" },
  { id: "fire", label: "Fire Station", number: "(072) 682-3344" },
];

export const aboutBarangay = {
  heading: "About Barangay",
  image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop",
  body: "Our barangay is committed to transparent, accessible public service. Browse projects, file reports, connect with neighbors, and reach your officials — all in one place.",
};

export const captain = {
  id: "captain",
  name: "FERNANDO C. FABRO",
  position: "Punong Barangay (Barangay Captain)",
  badge: "Head of Council",
  phone: "0912 345 6789",
  email: "captain@sta-rita.gov.ph",
  photo: "./src/components/photo/Punong_barangay.png",
};

export const kagawad = [
  { id: "k0", name: "LENY V. PANELO", role: "Barangay Secretary", photo: "./src/components/photo/sec.png" },
  { id: "k1", name: "REGINA ELENA O. DULAY", role: "Barangay Kagawad", committee: "Committee on Health", photo: "./src/components/photo/chs.png" },
  { id: "k2", name: "GLORIA D. ALBAY", role: "Barangay Kagawad", committee: "Peace & Order", photo: "./src/components/photo/cpo.png" },
  { id: "k3", name: "DOMINGO R. NARDO", role: "Barangay Kagawad", committee: "Committee Chair on Education", photo: "./src/components/photo/edu.png" },
  { id: "k4", name: "SALOME B. ALOOT", role: "Barangay Kagawad", committee: "Committee Chair on Budget and Appropriation", photo: "./src/components/photo/cba.png" },
  { id: "k5", name: "JO ANN V. ALOOT", role: "Barangay Kagawad", committee: "Committee Chair on Livelihood", photo: "./src/components/photo/livelihood.png" },
  { id: "k6", name: "AGNES C. MACASIEB", role: "Barangay Kagawad", committee: "Treasurer", photo: "./src/components/photo/treasurer.png" },
  { id: "k7", name: "AMADO R. ALOOT", role: "Barangay Kagawad", committee: "Committee Chair on Agriculture", photo: "./src/components/photo/agri.png" },
];

export const sidebarLinks = [
  { id: "profile", label: "Profile", icon: "User", to: "/profile" },
  { id: "announcement", label: "Announcements", icon: "Megaphone", to: "/announcements" },
  { id: "events", label: "Events", icon: "Calendar", to: "/events" },
  { id: "friends", label: "Find Friends", icon: "UserPlus", to: "/find-friends" },
  { id: "projects", label: "Projects", icon: "FolderKanban", to: "/projects" },
  { id: "reports", label: "Reports", icon: "BarChart3", to: "/reports" },
  { id: "request", label: "Request Document", icon: "FileText", to: "/request-document" },
  { id: "settings", label: "Settings", icon: "Settings", to: "/settings" },
];

export const navLinks = [
  { id: "home", label: "Home", to: "/" },
  { id: "friends", label: "Find Friends", to: "/find-friends" },
  { id: "announcements", label: "Announcements", to: "/announcements" },
  { id: "events", label: "Events", to: "/events" },
  { id: "officials", label: "Officials", to: "/officials" },
  { id: "chats", label: "Chats", to: "/chats" },
];
