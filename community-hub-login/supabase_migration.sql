-- ============================================================
-- Supabase / PostgreSQL Migration
-- Santa Rita Community Interactive Hub
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id               SERIAL PRIMARY KEY,
    username         VARCHAR(50)  NOT NULL UNIQUE,
    email            VARCHAR(100) NOT NULL UNIQUE,
    password         VARCHAR(255) NOT NULL,
    role             VARCHAR(20)  NOT NULL DEFAULT 'Resident',
    reset_code       VARCHAR(6)   DEFAULT NULL,
    reset_code_expires TIMESTAMP  DEFAULT NULL,
    reset_verified   INTEGER      DEFAULT 0,
    reset_attempts   INTEGER      DEFAULT 0,
    avatar           TEXT         DEFAULT NULL,
    is_online        INTEGER      DEFAULT 0,
    last_active      TIMESTAMP    DEFAULT NOW(),
    full_name        VARCHAR(150) DEFAULT NULL,
    phone            VARCHAR(50)  DEFAULT NULL,
    contact_number   VARCHAR(50)  DEFAULT NULL,
    address          VARCHAR(255) DEFAULT NULL,
    purok            VARCHAR(100) DEFAULT 'Purok 1, Sta. Rita Central'
);

CREATE TABLE IF NOT EXISTS messages (
    id              SERIAL PRIMARY KEY,
    sender_id       INTEGER      NOT NULL,
    receiver_id     INTEGER      DEFAULT NULL,
    conversation_id VARCHAR(100) DEFAULT NULL,
    text            TEXT         NOT NULL,
    is_read         INTEGER      DEFAULT 0,
    created_at      TIMESTAMP    DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_sender       ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver     ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

CREATE TABLE IF NOT EXISTS friends (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER     NOT NULL,
    friend_id  INTEGER     NOT NULL,
    status     VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP   DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);
CREATE INDEX IF NOT EXISTS idx_friends_user   ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend ON friends(friend_id);

CREATE TABLE IF NOT EXISTS announcements (
    id                SERIAL PRIMARY KEY,
    announcement_code VARCHAR(50)  NOT NULL,
    title             VARCHAR(255) NOT NULL,
    category          VARCHAR(100) DEFAULT 'Official Notice',
    date_info         VARCHAR(100) DEFAULT NULL,
    time_info         VARCHAR(100) DEFAULT '9:00 AM',
    location          VARCHAR(255) DEFAULT 'Barangay Hall',
    author            VARCHAR(150) DEFAULT 'Barangay Admin',
    content           TEXT         NOT NULL,
    badge             VARCHAR(50)  DEFAULT 'Notice',
    image             TEXT         DEFAULT NULL,
    created_at        TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    id              SERIAL PRIMARY KEY,
    event_code      VARCHAR(50)  NOT NULL UNIQUE,
    title           VARCHAR(255) NOT NULL,
    category        VARCHAR(100) DEFAULT 'Community',
    description     TEXT         DEFAULT NULL,
    event_date      VARCHAR(50)  NOT NULL,
    start_time      VARCHAR(50)  DEFAULT '9:00 AM',
    end_time        VARCHAR(50)  DEFAULT '12:00 PM',
    location        VARCHAR(255) DEFAULT 'Barangay Plaza',
    organizer       VARCHAR(150) DEFAULT 'Barangay Council',
    attendees_count INTEGER      DEFAULT 0,
    image           TEXT         DEFAULT NULL,
    created_at      TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_reports (
    id                  SERIAL PRIMARY KEY,
    report_code         VARCHAR(50)  NOT NULL,
    complainant_user_id INTEGER      DEFAULT NULL,
    case_type           VARCHAR(100) NOT NULL,
    complainant         VARCHAR(150) NOT NULL,
    contact_number      VARCHAR(50)  DEFAULT NULL,
    address             VARCHAR(255) DEFAULT NULL,
    respondent          VARCHAR(150) DEFAULT 'N/A',
    purok               VARCHAR(100) DEFAULT 'Purok 1',
    status              VARCHAR(50)  DEFAULT 'Pending',
    description         TEXT         DEFAULT NULL,
    details             TEXT         DEFAULT NULL,
    admin_remarks       TEXT         DEFAULT NULL,
    settlement_date     VARCHAR(50)  DEFAULT NULL,
    settle_by           VARCHAR(100) DEFAULT NULL,
    resolution_summary  TEXT         DEFAULT NULL,
    date_filed          TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doc_requests (
    id              SERIAL PRIMARY KEY,
    request_code    VARCHAR(50)  NOT NULL UNIQUE,
    applicant_name  VARCHAR(150) NOT NULL,
    doc_type        VARCHAR(100) NOT NULL,
    document_name   VARCHAR(100) NOT NULL,
    status          VARCHAR(50)  DEFAULT 'Pending',
    purpose         VARCHAR(255) DEFAULT 'General Purpose',
    address         VARCHAR(255) DEFAULT NULL,
    civil_status    VARCHAR(50)  DEFAULT 'Single',
    age             INTEGER      DEFAULT 25,
    ctc_no          VARCHAR(50)  DEFAULT NULL,
    or_no           VARCHAR(50)  DEFAULT NULL,
    date_requested  TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER      DEFAULT NULL,
    title      VARCHAR(255) NOT NULL,
    message    TEXT         NOT NULL,
    link       VARCHAR(255) DEFAULT NULL,
    is_read    INTEGER      DEFAULT 0,
    created_at TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS officials (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    position    VARCHAR(100) NOT NULL,
    rank_order  INTEGER      NOT NULL DEFAULT 10,
    committee   VARCHAR(150) DEFAULT NULL,
    photo       TEXT         DEFAULT NULL,
    term_start  VARCHAR(50)  DEFAULT '2023',
    term_end    VARCHAR(50)  DEFAULT '2026',
    is_active   INTEGER      DEFAULT 1,
    phone       VARCHAR(50)  DEFAULT NULL,
    email       VARCHAR(100) DEFAULT NULL,
    created_at  TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_stats (
    id         SERIAL PRIMARY KEY,
    stat_key   VARCHAR(50)  NOT NULL UNIQUE,
    stat_value VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_logs (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER      NOT NULL,
    username   VARCHAR(100) NOT NULL,
    role       VARCHAR(50)  DEFAULT 'Resident',
    ip_address VARCHAR(45)  DEFAULT NULL,
    user_agent TEXT         DEFAULT NULL,
    login_time TIMESTAMP    DEFAULT NOW()
);

-- ── SEED DATA ─────────────────────────────────────────────────
INSERT INTO users (id, username, email, password, role) VALUES
(1,'francis','francis@example.com','$2y$10$OYxpa9nFtHbZDuWEInBKSOU4BdqSxCdxtZ8ExDMFrp5XF2TiUeAu.','Admin'),
(2,'justinryan','deguzmanfrancis50@gmail.com','$2y$10$TNzev8xoAhWzEMLuemB1q.j.Kw1fMBcWy.TcXdCmyiETDlMyMJCLa','Resident'),
(3,'admin','admin@barangay.gov.ph','$2y$10$OYxpa9nFtHbZDuWEInBKSOU4BdqSxCdxtZ8ExDMFrp5XF2TiUeAu.','Admin'),
(4,'testresident','testresident@example.com','$2y$10$yXkbp/hZvzmvosXKh4LH4.3UJAqRpZxj3QXy2si7lYUklPRStqCd6','Resident'),
(5,'kyla','kylamovido5@gmail.com','$2y$10$yXkbp/hZvzmvosXKh4LH4.3UJAqRpZxj3QXy2si7lYUklPRStqCd6','Resident')
ON CONFLICT (username) DO NOTHING;
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

INSERT INTO friends (user_id, friend_id, status) VALUES
(2,3,'accepted'),(3,2,'accepted'),(2,5,'accepted'),(5,2,'accepted'),
(3,5,'accepted'),(5,3,'accepted'),(4,2,'pending'),(4,3,'pending')
ON CONFLICT (user_id, friend_id) DO NOTHING;

INSERT INTO dashboard_stats (stat_key, stat_value) VALUES
('population','12,480'),('household','3,150')
ON CONFLICT (stat_key) DO NOTHING;

INSERT INTO announcements (id, announcement_code, title, category, date_info, time_info, location, author, content, badge, image) VALUES
(2,'ANN-1','Barangay General Assembly & Town Hall','Official Assembly','Oct 10, 2026','9:00 AM','Barangay Sta. Rita Central Gymnasium','Barangay Council','All residents invited to the quarterly General Assembly.','Important','./src/components/photo/genassembly.jpg'),
(3,'ANN-2','Free Medical & Dental Mission','Health & Wellness','Oct 15, 2026','8:00 AM - 3:00 PM','Barangay Health Center','Committee on Health','Free checkups and dental extractions for registered residents.','Public Service','./src/components/photo/annimg.jpg'),
(4,'ANN-3','Clean-Up Drive & Environmental Awareness','Environment','Oct 20, 2026','6:00 AM','Purok 1 to Purok 5 Coastal Area','SK Youth Council','Join our monthly coastal & street clean-up drive.','Volunteer','./src/components/photo/clean.jpg')
ON CONFLICT DO NOTHING;
SELECT setval('announcements_id_seq', (SELECT MAX(id) FROM announcements));

INSERT INTO events (id, event_code, title, category, description, event_date, start_time, end_time, location, organizer, attendees_count, image) VALUES
(1,'EVT-1','SK Youth Basketball & Volleyball League','Sports','Annual Barangay Inter-Purok Sports League.','Oct 12, 2026','04:00 PM','07:00 PM','Sta. Rita Covered Court','SK Youth Council',42,'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800'),
(2,'EVT-2','Senior Citizens Wellness Checkup & Pension Payout','Senior Affairs','Monthly pension payout and free health screening.','Oct 18, 2026','09:00 AM','12:00 PM','Barangay Multipurpose Hall','Office for Senior Citizens Affairs',88,'./src/components/photo/annimg.jpg'),
(3,'EVT-3','Disaster Preparedness & Fire Safety Drill','Safety','Hands-on fire extinguisher and earthquake drill.','Oct 25, 2026','01:30 PM','04:30 PM','Barangay Plaza','BFP & Barangay Tanod Unit',65,'./src/components/photo/clean.jpg')
ON CONFLICT (event_code) DO NOTHING;
SELECT setval('events_id_seq', (SELECT MAX(id) FROM events));

INSERT INTO officials (id, name, position, rank_order, committee, photo, term_start, term_end, is_active, phone, email) VALUES
(1,'FERNANDO C. FABRO','Punong Barangay (Barangay Captain)',1,'Head of Council','/src/components/photo/Punong_barangay.png','2023','2026',1,'0912 345 6789','captain@sta-rita.gov.ph'),
(2,'REGINA ELENA O. DULAY','Barangay Kagawad',2,'Committee on Health','/src/components/photo/chs.png','2023','2026',1,'0912 345 0001','rdulay@sta-rita.gov.ph'),
(3,'DOMINGO R. NARDO','Barangay Kagawad',3,'Committee Chair on Education','/src/components/photo/edu.png','2023','2026',1,'0912 345 0002','dnardo@sta-rita.gov.ph'),
(4,'SALOME B. ALOOT','Barangay Kagawad',4,'Committee Chair on Budget and Appropriation','/src/components/photo/cba.png','2023','2026',1,'0912 345 0003','saloot@sta-rita.gov.ph'),
(5,'JO ANN V. ALOOT','Barangay Kagawad',5,'Committee Chair on Livelihood','/src/components/photo/livelihood.png','2023','2026',1,'0912 345 0004','jvaloot@sta-rita.gov.ph'),
(6,'GLORIA D. ALBAY','Barangay Kagawad',6,'Peace & Order','/src/components/photo/cpo.png','2023','2026',1,'0912 345 0005','galbay@sta-rita.gov.ph'),
(7,'AMADO R. ALOOT','Barangay Kagawad',7,'Committee Chair on Agriculture','/src/components/photo/agri.png','2023','2026',1,'0912 345 0006','amaloot@sta-rita.gov.ph'),
(8,'MARK JOSEPH RAMOS','Barangay Kagawad',8,'Committee Chair on Youth & Sports',NULL,'2023','2026',1,'0912 345 0007','mjramos@sta-rita.gov.ph'),
(9,'PATRICIA MAE REYES','SK Chairperson',9,'Sangguniang Kabataan Affairs',NULL,'2023','2026',1,'0912 345 0008','skchair@sta-rita.gov.ph'),
(10,'LENY V. PANELO','Barangay Secretary',10,'Secretariat & Records','/src/components/photo/sec.png','2023','2026',1,'0912 345 0009','secretary@sta-rita.gov.ph'),
(11,'AGNES C. MACASIEB','Barangay Treasurer',11,'Treasury & Disbursements','/src/components/photo/treasurer.png','2023','2026',1,'0912 345 0010','treasurer@sta-rita.gov.ph')
ON CONFLICT DO NOTHING;
SELECT setval('officials_id_seq', (SELECT MAX(id) FROM officials));

INSERT INTO notifications (user_id, title, message, link) VALUES
(NULL,'Welcome to Community Hub!','Explore official announcements, events, and public services for Barangay Sta. Rita Central.','/announcements'),
(NULL,'Document Request Desk Active','You can now submit Barangay Clearance and Residency requests online.','/request-document')
ON CONFLICT DO NOTHING;

INSERT INTO incident_reports (id, report_code, case_type, complainant, respondent, purok, status, description) VALUES
(1,'REP-2026-001','Boundary Dispute','Juan Dela Cruz','Pedro Santos','Purok 2','Settled','Boundary disagreement regarding residential fence line.'),
(2,'REP-2026-002','Noise Complaint','Maria Santos','Barangay Videoke Rental','Purok 3','Pending','Excessive loud music beyond 10:00 PM curfew hours.'),
(3,'REP-2026-003','Public Disturbance','Ricardo Gomez','N/A','Purok 1','In Progress','Unruly gatherings near basketball court during late night hours.')
ON CONFLICT DO NOTHING;
SELECT setval('incident_reports_id_seq', (SELECT MAX(id) FROM incident_reports));

INSERT INTO doc_requests (id, request_code, applicant_name, doc_type, document_name, status, purpose, address, civil_status, age, ctc_no, or_no) VALUES
(1,'DOC-2026-101','FRANCIS REGIE DE GUZMAN','BARANGAY CLEARANCE','Barangay Clearance','Approved','Employment Application','Purok 3, Sta. Rita Central, Agoo, La Union','Single',25,'CTC-2026-8812','OR-94120'),
(2,'DOC-2026-102','KYLA MOVIDO','CERTIFICATE OF INDIGENCY','Certificate of Indigency','Pending','Educational Scholarship Assistance','Purok 1, Sta. Rita Central','Single',22,'CTC-2026-3391','OR-81192')
ON CONFLICT (request_code) DO NOTHING;
SELECT setval('doc_requests_id_seq', (SELECT MAX(id) FROM doc_requests));
