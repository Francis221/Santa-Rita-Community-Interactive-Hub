<?php
// ---- Keep PHP warnings/notices out of JSON responses ----
ini_set('display_errors', '0');
ini_set('log_errors', '1');
if (file_exists('/dev/stderr')) {
    ini_set('error_log', '/dev/stderr');
}
error_reporting(E_ALL);

date_default_timezone_set('Asia/Manila');

function out($data, $code = 200)
{
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
    }
    http_response_code($code);
    echo json_encode($data);
    exit;
}

set_exception_handler(function ($e) {
    error_log('Uncaught: ' . $e->getMessage());
    out(['success' => false, 'message' => 'Server error. Please try again.'], 500);
});

// ---- Session ----
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'path' => '/']);
    session_start();
}

// ---- CSRF Protection Helpers ----
function get_csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf_token(?string $token): bool
{
    if (empty($token) || empty($_SESSION['csrf_token'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

// ---- CORS: Allow Vercel, localhost, and custom domains ----
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
if ($origin !== '*') {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    header("Access-Control-Allow-Origin: *");
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Access-Control-Max-Age: 86400');
header('Vary: Origin');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if (php_sapi_name() !== 'cli') {
    header('Content-Type: application/json; charset=utf-8');
}

// ---- Database Connection Config ----

// Supabase PostgreSQL (PRIMARY - works from Render, no locking issues)
$supabaseUrl    = getenv('SUPABASE_DB_URL')  ?: ($_ENV['SUPABASE_DB_URL']  ?? '');
$supabasePass   = getenv('SUPABASE_DB_PASS') ?: ($_ENV['SUPABASE_DB_PASS'] ?? 'YBca!-V&3%r_8a8');
$supabaseRef    = 'nbkbijmelwlareisrwfl';
$supabaseHost   = "db.{$supabaseRef}.supabase.co";
$supabasePort   = '5432';
$supabaseDbName = 'postgres';
$supabaseUser   = 'postgres';

// MySQL fallback
$envHost = getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? ($_SERVER['DB_HOST'] ?? ''));
$envName = getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? ($_SERVER['DB_NAME'] ?? ''));
$envUser = getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? ($_SERVER['DB_USER'] ?? ''));
$envPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : ($_ENV['DB_PASS'] ?? ($_SERVER['DB_PASS'] ?? ''));
$envPort = getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? ($_SERVER['DB_PORT'] ?? '3306'));

$isLocalhost = in_array($_SERVER['SERVER_NAME'] ?? '', ['127.0.0.1', 'localhost']) || (php_sapi_name() === 'cli' && empty($envHost));

$db = null;

// ── 0. Try Supabase PostgreSQL first (PRIMARY) ──────────────────────────
if ($supabasePass !== '' || $supabaseUrl !== '') {
    $pgPass = $supabasePass ?: $supabaseUrl;
    try {
        $db = new PDO(
            "pgsql:host={$supabaseHost};port={$supabasePort};dbname={$supabaseDbName};sslmode=require",
            $supabaseUser, $pgPass,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT => 5
            ]
        );
        try { $db->exec("SET TIME ZONE 'Asia/Manila'"); } catch (Throwable $tzErr) {}
        error_log('Connected to Supabase PostgreSQL successfully');

        // ── Reset known passwords on Supabase so login works reliably ──
        // admin -> password: admin
        try {
            $db->prepare("UPDATE users SET password = ? WHERE username = 'admin' OR email = 'admin@barangay.gov.ph'")
               ->execute([password_hash('admin', PASSWORD_BCRYPT)]);
            error_log('Reset admin password on Supabase');
        } catch (Throwable $e) { error_log('Supabase admin reset err: ' . $e->getMessage()); }

        // francis / justinryan / deguzmanfrancis50@gmail.com -> password: Francis25
        try {
            $db->prepare("UPDATE users SET password = ? WHERE username = 'francis' OR email = 'francis@example.com' OR email = 'deguzmanfrancis50@gmail.com' OR username = 'justinryan'")
               ->execute([password_hash('Francis25', PASSWORD_BCRYPT)]);
            error_log('Reset francis password on Supabase');
        } catch (Throwable $e) { error_log('Supabase francis reset err: ' . $e->getMessage()); }

    } catch (Throwable $e) {
        $db = null;
        error_log('Supabase PostgreSQL failed, trying MySQL: ' . $e->getMessage());
    }
}

// ── 1. MySQL fallback — only if Supabase did NOT connect ──────
if (!$db) {

if ($isLocalhost && empty($envHost)) {
    $dbHost = '127.0.0.1'; $dbName = 'login_system'; $dbUser = 'root'; $dbPass = ''; $dbPort = '3306';
} else {
    $dbHost = $envHost ?: 'sql302.infinityfree.com';
    $dbName = $envName ?: 'if0_43140654_login_system';
    $dbUser = $envUser ?: 'if0_43140654';
    $dbPass = $envPass !== '' ? $envPass : 'tr2Rcq8LuP7tX';
    $dbPort = $envPort ?: '3306';
}

try {
    $db = new PDO("mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 3
    ]);
    // Make MySQL NOW() match Asia/Manila (UTC+8) so expiry checks are consistent
    $db->exec("SET time_zone = '+08:00'");

    // Ensure all required columns exist in MySQL users table
    try { $db->exec("ALTER TABLE users ADD COLUMN avatar LONGTEXT DEFAULT NULL"); } catch (Throwable $e) {}
    try { $db->exec("ALTER TABLE users ADD COLUMN is_online TINYINT(1) DEFAULT 0"); } catch (Throwable $e) {}
    try { $db->exec("ALTER TABLE users ADD COLUMN last_active DATETIME DEFAULT CURRENT_TIMESTAMP"); } catch (Throwable $e) {}
    try { $db->exec("ALTER TABLE users ADD COLUMN reset_code VARCHAR(6) DEFAULT NULL"); } catch (Throwable $e) {}
    try { $db->exec("ALTER TABLE users ADD COLUMN reset_code_expires DATETIME DEFAULT NULL"); } catch (Throwable $e) {}
    try { $db->exec("ALTER TABLE users ADD COLUMN reset_verified TINYINT(1) DEFAULT 0"); } catch (Throwable $e) {}
    try { $db->exec("ALTER TABLE users ADD COLUMN reset_attempts INT DEFAULT 0"); } catch (Throwable $e) {}

    // Ensure friends table exists in MySQL
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS friends (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            friend_id INT NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY (user_id, friend_id),
            INDEX (user_id),
            INDEX (friend_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } catch (Throwable $e) {}

    // Ensure notifications table exists in MySQL
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT DEFAULT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            link VARCHAR(255) DEFAULT NULL,
            is_read TINYINT(1) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX (user_id),
            INDEX (is_read),
            INDEX (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } catch (Throwable $e) {}

    // Ensure dashboard_stats table exists in MySQL
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS dashboard_stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            stat_key VARCHAR(50) NOT NULL UNIQUE,
            stat_value VARCHAR(100) NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // Seed default stats if not exists
        $statCount = (int)$db->query("SELECT COUNT(*) FROM dashboard_stats")->fetchColumn();
        if ($statCount === 0) {
            $db->exec("INSERT IGNORE INTO dashboard_stats (stat_key, stat_value) VALUES 
                ('population', '12,480'),
                ('household', '3,150');");
        }
    } catch (Throwable $e) {}

    // Migrations for incident_reports table
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS incident_reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            report_code VARCHAR(50) NOT NULL,
            complainant_user_id INT DEFAULT NULL,
            case_type VARCHAR(100) NOT NULL,
            complainant VARCHAR(150) NOT NULL,
            contact_number VARCHAR(50) DEFAULT NULL,
            address VARCHAR(255) DEFAULT NULL,
            respondent VARCHAR(150) DEFAULT 'N/A',
            purok VARCHAR(100) DEFAULT 'Purok 1',
            status VARCHAR(50) DEFAULT 'Pending',
            description TEXT DEFAULT NULL,
            details TEXT DEFAULT NULL,
            admin_remarks TEXT DEFAULT NULL,
            settlement_date VARCHAR(50) DEFAULT NULL,
            settle_by VARCHAR(100) DEFAULT NULL,
            resolution_summary TEXT DEFAULT NULL,
            date_filed DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX (complainant_user_id),
            INDEX (status),
            INDEX (date_filed)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN complainant_user_id INT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN contact_number VARCHAR(50) DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN address VARCHAR(255) DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN admin_remarks TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN description TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN details TEXT DEFAULT NULL"); } catch (Throwable $e) {}

        // Backfill complainant_user_id where possible (match username or default to resident user id 2)
        try {
            $db->exec("UPDATE incident_reports r 
                       INNER JOIN users u ON (LOWER(r.complainant) = LOWER(u.username) OR LOWER(r.complainant) LIKE CONCAT('%', LOWER(u.username), '%'))
                       SET r.complainant_user_id = u.id 
                       WHERE r.complainant_user_id IS NULL");
            $db->exec("UPDATE incident_reports SET complainant_user_id = 2 WHERE complainant_user_id IS NULL");
        } catch (Throwable $e) {}
    } catch (Throwable $e) {}

    // Migrations for users table (phone, address, full_name)
    try {
        try { $db->exec("ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN contact_number VARCHAR(50) DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN address VARCHAR(255) DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN purok VARCHAR(100) DEFAULT 'Purok 1, Sta. Rita Central'"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN full_name VARCHAR(150) DEFAULT NULL"); } catch (Throwable $e) {}
        // Set sample default profile details if empty
        $db->exec("UPDATE users SET full_name = 'Francis Regie De Guzman', phone = '0912 345 6789', address = 'Purok 1, Sta. Rita Central, Agoo' WHERE id = 1 AND full_name IS NULL");
        $db->exec("UPDATE users SET full_name = 'Justin Ryan De Guzman', phone = '0920 889 1234', address = 'Purok 2, Sta. Rita Central, Agoo' WHERE id = 2 AND full_name IS NULL");
        $db->exec("UPDATE users SET full_name = 'Barangay Administrator', phone = '(072) 682-8899', address = 'Barangay Hall, Sta. Rita Central' WHERE id = 3 AND full_name IS NULL");
        $db->exec("UPDATE users SET full_name = 'Test Resident', phone = '0999 111 2233', address = 'Purok 4, Sta. Rita Central' WHERE id = 4 AND full_name IS NULL");
        $db->exec("UPDATE users SET full_name = 'Kyla Movido', phone = '0917 555 6789', address = 'Purok 3, Sta. Rita Central' WHERE id = 5 AND full_name IS NULL");
    } catch (Throwable $e) {}

    // Officials table & seed
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS officials (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            position VARCHAR(100) NOT NULL,
            rank_order INT NOT NULL DEFAULT 10,
            committee VARCHAR(150) DEFAULT NULL,
            photo LONGTEXT DEFAULT NULL,
            term_start VARCHAR(50) DEFAULT '2023',
            term_end VARCHAR(50) DEFAULT '2026',
            is_active TINYINT(1) DEFAULT 1,
            phone VARCHAR(50) DEFAULT NULL,
            email VARCHAR(100) DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX (rank_order),
            INDEX (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $offCount = (int)$db->query("SELECT COUNT(*) FROM officials")->fetchColumn();
        if ($offCount === 0) {
            $db->exec("INSERT INTO officials (name, position, rank_order, committee, photo, term_start, term_end, is_active, phone, email) VALUES
                ('FERNANDO C. FABRO', 'Punong Barangay (Barangay Captain)', 1, 'Head of Council', '/src/components/photo/Punong_barangay.png', '2023', '2026', 1, '0912 345 6789', 'captain@sta-rita.gov.ph'),
                ('REGINA ELENA O. DULAY', 'Barangay Kagawad', 2, 'Committee on Health', '/src/components/photo/chs.png', '2023', '2026', 1, '0912 345 0001', 'rdulay@sta-rita.gov.ph'),
                ('DOMINGO R. NARDO', 'Barangay Kagawad', 3, 'Committee Chair on Education', '/src/components/photo/edu.png', '2023', '2026', 1, '0912 345 0002', 'dnardo@sta-rita.gov.ph'),
                ('SALOME B. ALOOT', 'Barangay Kagawad', 4, 'Committee Chair on Budget and Appropriation', '/src/components/photo/cba.png', '2023', '2026', 1, '0912 345 0003', 'saloot@sta-rita.gov.ph'),
                ('JO ANN V. ALOOT', 'Barangay Kagawad', 5, 'Committee Chair on Livelihood', '/src/components/photo/livelihood.png', '2023', '2026', 1, '0912 345 0004', 'jvaloot@sta-rita.gov.ph'),
                ('GLORIA D. ALBAY', 'Barangay Kagawad', 6, 'Peace & Order', '/src/components/photo/cpo.png', '2023', '2026', 1, '0912 345 0005', 'galbay@sta-rita.gov.ph'),
                ('AMADO R. ALOOT', 'Barangay Kagawad', 7, 'Committee Chair on Agriculture', '/src/components/photo/agri.png', '2023', '2026', 1, '0912 345 0006', 'amaloot@sta-rita.gov.ph'),
                ('MARK JOSEPH RAMOS', 'Barangay Kagawad', 8, 'Committee Chair on Youth & Sports', NULL, '2023', '2026', 1, '0912 345 0007', 'mjramos@sta-rita.gov.ph'),
                ('PATRICIA MAE REYES', 'SK Chairperson', 9, 'Sangguniang Kabataan Affairs', NULL, '2023', '2026', 1, '0912 345 0008', 'skchair@sta-rita.gov.ph'),
                ('LENY V. PANELO', 'Barangay Secretary', 10, 'Secretariat & Records', '/src/components/photo/sec.png', '2023', '2026', 1, '0912 345 0009', 'secretary@sta-rita.gov.ph'),
                ('AGNES C. MACASIEB', 'Barangay Treasurer', 11, 'Treasury & Disbursements', '/src/components/photo/treasurer.png', '2023', '2026', 1, '0912 345 0010', 'treasurer@sta-rita.gov.ph');");
        }
    } catch (Throwable $e) {}

    // Events table & seed
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_code VARCHAR(50) NOT NULL UNIQUE,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(100) DEFAULT 'Community',
            description TEXT DEFAULT NULL,
            event_date VARCHAR(50) NOT NULL,
            start_time VARCHAR(50) DEFAULT '9:00 AM',
            end_time VARCHAR(50) DEFAULT '12:00 PM',
            location VARCHAR(255) DEFAULT 'Barangay Plaza',
            organizer VARCHAR(150) DEFAULT 'Barangay Council',
            attendees_count INT DEFAULT 0,
            image LONGTEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX (event_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $evtCount = (int)$db->query("SELECT COUNT(*) FROM events")->fetchColumn();
        if ($evtCount === 0) {
            $db->exec("INSERT INTO events (event_code, title, category, description, event_date, start_time, end_time, location, organizer, attendees_count, image) VALUES
                ('EVT-1', 'SK Youth Basketball & Volleyball League', 'Sports', 'Annual Barangay Inter-Purok Sports League kick-off ceremony. Cheer for your purok teams!', 'Oct 12, 2026', '04:00 PM', '07:00 PM', 'Sta. Rita Covered Court', 'SK Youth Council', 42, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80'),
                ('EVT-2', 'Senior Citizens Wellness Checkup & Pension Payout', 'Senior Affairs', 'Monthly social pension payout and free blood pressure & glucose screening for seniors.', 'Oct 18, 2026', '09:00 AM', '12:00 PM', 'Barangay Multipurpose Hall', 'Office for Senior Citizens Affairs', 88, './src/components/photo/annimg.jpg'),
                ('EVT-3', 'Disaster Preparedness & Fire Safety Drill', 'Safety', 'Hands-on fire extinguisher usage demonstration, earthquake drill, and emergency kit prep tutorial.', 'Oct 25, 2026', '01:30 PM', '04:30 PM', 'Barangay Plaza', 'BFP & Barangay Tanod Unit', 65, './src/components/photo/clean.jpg');");
        }
    } catch (Throwable $e) {}

    // Ensure user deguzmanfrancis50@gmail.com has password Francis25
    try {
        $checkStmt = $db->prepare("SELECT id, password FROM users WHERE email = 'deguzmanfrancis50@gmail.com' LIMIT 1");
        $checkStmt->execute();
        $checkUser = $checkStmt->fetch();
        if ($checkUser && (password_verify('password123', $checkUser['password']) || $checkUser['password'] === 'password123')) {
            $newFrancisPass = password_hash('Francis25', PASSWORD_BCRYPT);
            $db->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$newFrancisPass, $checkUser['id']]);
        }
    } catch (Throwable $e) {}

    // Ensure user admin@barangay.gov.ph has password admin
    try {
        $adminStmt = $db->prepare("SELECT id, password FROM users WHERE email = 'admin@barangay.gov.ph' OR username = 'admin' LIMIT 1");
        $adminStmt->execute();
        $adminUser = $adminStmt->fetch();
        if ($adminUser) {
            $newAdminPass = password_hash('admin', PASSWORD_BCRYPT);
            $db->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$newAdminPass, $adminUser['id']]);
        }
    } catch (Throwable $e) {}
} catch (Throwable $e) {
    $db = null;
    error_log('MySQL connection failed, falling back to SQLite: ' . $e->getMessage());
}

} // end if (!$db) — MySQL fallback block

// 2. High-Availability SQLite Database Fallback
if (!$db) {
    try {
        $sqlitePath = sys_get_temp_dir() . '/login_system.sqlite';
        $isNewDb = !file_exists($sqlitePath);
        $db = new PDO('sqlite:' . $sqlitePath, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        // WAL mode: prevents "database is locked" when concurrent requests write
        $db->exec('PRAGMA journal_mode=WAL');
        $db->exec('PRAGMA busy_timeout=10000'); // wait up to 10s before failing
        $db->exec('PRAGMA synchronous=NORMAL'); // faster writes, safe with WAL

        // Register custom SQL functions for compatibility with MySQL queries
        $db->sqliteCreateFunction('NOW', function () {
            return date('Y-m-d H:i:s');
        });
        $db->sqliteCreateFunction('CURDATE', function () {
            return date('Y-m-d');
        });
        $db->sqliteCreateFunction('IF', function ($cond, $t, $f) {
            return $cond ? $t : $f;
        });

        if ($isNewDb) {
            $db->exec("
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    email TEXT NOT NULL,
                    password TEXT NOT NULL,
                    role TEXT DEFAULT 'Resident',
                    avatar TEXT DEFAULT NULL,
                    is_online INTEGER DEFAULT 0,
                    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sender_id INTEGER NOT NULL,
                    receiver_id INTEGER DEFAULT NULL,
                    conversation_id TEXT DEFAULT NULL,
                    text TEXT NOT NULL,
                    is_read INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS announcements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    announcement_code TEXT NOT NULL,
                    title TEXT NOT NULL,
                    category TEXT DEFAULT 'Official Notice',
                    date_info TEXT DEFAULT NULL,
                    time_info TEXT DEFAULT '9:00 AM',
                    location TEXT DEFAULT 'Barangay Hall',
                    author TEXT DEFAULT 'Barangay Council',
                    content TEXT NOT NULL,
                    badge TEXT DEFAULT 'Active',
                    image TEXT DEFAULT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS incident_reports (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    report_code TEXT NOT NULL UNIQUE,
                    case_type TEXT NOT NULL,
                    complainant TEXT NOT NULL,
                    respondent TEXT DEFAULT NULL,
                    purok TEXT DEFAULT 'Purok 1',
                    status TEXT DEFAULT 'Pending',
                    details TEXT DEFAULT NULL,
                    description TEXT DEFAULT NULL,
                    date_filed DATE DEFAULT CURRENT_DATE,
                    settlement_date DATE DEFAULT NULL,
                    settle_by TEXT DEFAULT NULL,
                    resolution_summary TEXT DEFAULT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS doc_requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    request_code TEXT NOT NULL UNIQUE,
                    applicant_name TEXT NOT NULL,
                    doc_type TEXT NOT NULL,
                    document_name TEXT NOT NULL,
                    status TEXT DEFAULT 'Pending',
                    purpose TEXT NOT NULL,
                    address TEXT NOT NULL,
                    civil_status TEXT DEFAULT 'Single',
                    age INTEGER DEFAULT 25,
                    ctc_no TEXT DEFAULT NULL,
                    or_no TEXT DEFAULT NULL,
                    date_requested DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS login_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    username TEXT NOT NULL,
                    role TEXT NOT NULL,
                    ip_address TEXT DEFAULT NULL,
                    user_agent TEXT DEFAULT NULL,
                    login_time DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS friends (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    friend_id INTEGER NOT NULL,
                    status TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, friend_id)
                );
            ");

            $adminPass = password_hash('admin', PASSWORD_BCRYPT);
            $userPass = password_hash('password123', PASSWORD_BCRYPT);
            $francisPass = password_hash('Francis25', PASSWORD_BCRYPT);
            $db->exec("
                INSERT OR IGNORE INTO users (id, username, email, password, role, is_online) VALUES 
                (1, 'francis', 'francis@example.com', '{$adminPass}', 'Admin', 0),
                (2, 'justinryan', 'deguzmanfrancis50@gmail.com', '{$francisPass}', 'Resident', 1),
                (3, 'admin', 'admin@barangay.gov.ph', '{$adminPass}', 'Admin', 1),
                (4, 'testresident', 'testresident@example.com', '{$userPass}', 'Resident', 0),
                (5, 'kyla', 'kylamovido5@gmail.com', '{$userPass}', 'Resident', 0);
            ");

            $db->exec("
                INSERT OR IGNORE INTO friends (id, user_id, friend_id, status) VALUES 
                (1, 2, 3, 'accepted'), (2, 3, 2, 'accepted'),
                (3, 2, 5, 'accepted'), (4, 5, 2, 'accepted'),
                (5, 3, 5, 'accepted'), (6, 5, 3, 'accepted'),
                (7, 4, 2, 'pending'),  (8, 4, 3, 'pending');
            ");
        }

        // Migration: Ensure friends and other columns exist in SQLite database
        try {
            $db->exec("CREATE TABLE IF NOT EXISTS friends (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                friend_id INTEGER NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, friend_id)
            );");
            $fCount = $db->query("SELECT COUNT(*) FROM friends")->fetchColumn();
            if ($fCount == 0) {
                $db->exec("INSERT OR IGNORE INTO friends (id, user_id, friend_id, status) VALUES 
                (1, 2, 3, 'accepted'), (2, 3, 2, 'accepted'),
                (3, 2, 5, 'accepted'), (4, 5, 2, 'accepted'),
                (5, 3, 5, 'accepted'), (6, 5, 3, 'accepted'),
                (7, 4, 2, 'pending'),  (8, 4, 3, 'pending');");
            }
        } catch (Throwable $e) {}

        // SQLite: notifications & dashboard_stats
        try {
            $db->exec("CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER DEFAULT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                link TEXT DEFAULT NULL,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );");
        } catch (Throwable $e) {}

        try {
            $db->exec("CREATE TABLE IF NOT EXISTS dashboard_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stat_key TEXT NOT NULL UNIQUE,
                stat_value TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );");
            $sCount = (int)$db->query("SELECT COUNT(*) FROM dashboard_stats")->fetchColumn();
            if ($sCount === 0) {
                $db->exec("INSERT OR IGNORE INTO dashboard_stats (stat_key, stat_value) VALUES 
                    ('population', '12,480'),
                    ('household', '3,150');");
            }
        } catch (Throwable $e) {}

        // Migration: Ensure reset password columns exist in SQLite users table
        try { $db->exec("ALTER TABLE users ADD COLUMN reset_code TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN reset_code_expires DATETIME DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN reset_verified INTEGER DEFAULT 0"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN reset_attempts INTEGER DEFAULT 0"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN contact_number TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN address TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN purok TEXT DEFAULT 'Purok 1, Sta. Rita Central'"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN full_name TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try {
            $db->exec("UPDATE users SET full_name = 'Francis Regie De Guzman', phone = '0912 345 6789', address = 'Purok 1, Sta. Rita Central, Agoo' WHERE id = 1 AND full_name IS NULL");
            $db->exec("UPDATE users SET full_name = 'Justin Ryan De Guzman', phone = '0920 889 1234', address = 'Purok 2, Sta. Rita Central, Agoo' WHERE id = 2 AND full_name IS NULL");
            $db->exec("UPDATE users SET full_name = 'Barangay Administrator', phone = '(072) 682-8899', address = 'Barangay Hall, Sta. Rita Central' WHERE id = 3 AND full_name IS NULL");
            $db->exec("UPDATE users SET full_name = 'Test Resident', phone = '0999 111 2233', address = 'Purok 4, Sta. Rita Central' WHERE id = 4 AND full_name IS NULL");
            $db->exec("UPDATE users SET full_name = 'Kyla Movido', phone = '0917 555 6789', address = 'Purok 3, Sta. Rita Central' WHERE id = 5 AND full_name IS NULL");
        } catch (Throwable $e) {}

        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN description TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN details TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN complainant_user_id INTEGER DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN contact_number TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN address TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN admin_remarks TEXT DEFAULT NULL"); } catch (Throwable $e) {}

        // SQLite backfill
        try {
            $db->exec("UPDATE incident_reports SET complainant_user_id = 2 WHERE complainant_user_id IS NULL");
        } catch (Throwable $e) {}

        // SQLite officials table & seed
        try {
            $db->exec("CREATE TABLE IF NOT EXISTS officials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                position TEXT NOT NULL,
                rank_order INTEGER NOT NULL DEFAULT 10,
                committee TEXT DEFAULT NULL,
                photo TEXT DEFAULT NULL,
                term_start TEXT DEFAULT '2023',
                term_end TEXT DEFAULT '2026',
                is_active INTEGER DEFAULT 1,
                phone TEXT DEFAULT NULL,
                email TEXT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );");

            $oCount = (int)$db->query("SELECT COUNT(*) FROM officials")->fetchColumn();
            if ($oCount === 0) {
                $db->exec("INSERT INTO officials (name, position, rank_order, committee, photo, term_start, term_end, is_active, phone, email) VALUES
                    ('FERNANDO C. FABRO', 'Punong Barangay (Barangay Captain)', 1, 'Head of Council', '/src/components/photo/Punong_barangay.png', '2023', '2026', 1, '0912 345 6789', 'captain@sta-rita.gov.ph'),
                    ('REGINA ELENA O. DULAY', 'Barangay Kagawad', 2, 'Committee on Health', '/src/components/photo/chs.png', '2023', '2026', 1, '0912 345 0001', 'rdulay@sta-rita.gov.ph'),
                    ('DOMINGO R. NARDO', 'Barangay Kagawad', 3, 'Committee Chair on Education', '/src/components/photo/edu.png', '2023', '2026', 1, '0912 345 0002', 'dnardo@sta-rita.gov.ph'),
                    ('SALOME B. ALOOT', 'Barangay Kagawad', 4, 'Committee Chair on Budget and Appropriation', '/src/components/photo/cba.png', '2023', '2026', 1, '0912 345 0003', 'saloot@sta-rita.gov.ph'),
                    ('JO ANN V. ALOOT', 'Barangay Kagawad', 5, 'Committee Chair on Livelihood', '/src/components/photo/livelihood.png', '2023', '2026', 1, '0912 345 0004', 'jvaloot@sta-rita.gov.ph'),
                    ('GLORIA D. ALBAY', 'Barangay Kagawad', 6, 'Peace & Order', '/src/components/photo/cpo.png', '2023', '2026', 1, '0912 345 0005', 'galbay@sta-rita.gov.ph'),
                    ('AMADO R. ALOOT', 'Barangay Kagawad', 7, 'Committee Chair on Agriculture', '/src/components/photo/agri.png', '2023', '2026', 1, '0912 345 0006', 'amaloot@sta-rita.gov.ph'),
                    ('MARK JOSEPH RAMOS', 'Barangay Kagawad', 8, 'Committee Chair on Youth & Sports', NULL, '2023', '2026', 1, '0912 345 0007', 'mjramos@sta-rita.gov.ph'),
                    ('PATRICIA MAE REYES', 'SK Chairperson', 9, 'Sangguniang Kabataan Affairs', NULL, '2023', '2026', 1, '0912 345 0008', 'skchair@sta-rita.gov.ph'),
                    ('LENY V. PANELO', 'Barangay Secretary', 10, 'Secretariat & Records', '/src/components/photo/sec.png', '2023', '2026', 1, '0912 345 0009', 'secretary@sta-rita.gov.ph'),
                    ('AGNES C. MACASIEB', 'Barangay Treasurer', 11, 'Treasury & Disbursements', '/src/components/photo/treasurer.png', '2023', '2026', 1, '0912 345 0010', 'treasurer@sta-rita.gov.ph');");
            }
        } catch (Throwable $e) {}

        // SQLite events table & seed
        try {
            $db->exec("CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_code TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                category TEXT DEFAULT 'Community',
                description TEXT DEFAULT NULL,
                event_date TEXT NOT NULL,
                start_time TEXT DEFAULT '9:00 AM',
                end_time TEXT DEFAULT '12:00 PM',
                location TEXT DEFAULT 'Barangay Plaza',
                organizer TEXT DEFAULT 'Barangay Council',
                attendees_count INTEGER DEFAULT 0,
                image TEXT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );");

            $eCount = (int)$db->query("SELECT COUNT(*) FROM events")->fetchColumn();
            if ($eCount === 0) {
                $db->exec("INSERT INTO events (event_code, title, category, description, event_date, start_time, end_time, location, organizer, attendees_count, image) VALUES
                    ('EVT-1', 'SK Youth Basketball & Volleyball League', 'Sports', 'Annual Barangay Inter-Purok Sports League kick-off ceremony. Cheer for your purok teams!', 'Oct 12, 2026', '04:00 PM', '07:00 PM', 'Sta. Rita Covered Court', 'SK Youth Council', 42, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80'),
                    ('EVT-2', 'Senior Citizens Wellness Checkup & Pension Payout', 'Senior Affairs', 'Monthly social pension payout and free blood pressure & glucose screening for seniors.', 'Oct 18, 2026', '09:00 AM', '12:00 PM', 'Barangay Multipurpose Hall', 'Office for Senior Citizens Affairs', 88, './src/components/photo/annimg.jpg'),
                    ('EVT-3', 'Disaster Preparedness & Fire Safety Drill', 'Safety', 'Hands-on fire extinguisher usage demonstration, earthquake drill, and emergency kit prep tutorial.', 'Oct 25, 2026', '01:30 PM', '04:30 PM', 'Barangay Plaza', 'BFP & Barangay Tanod Unit', 65, './src/components/photo/clean.jpg');");
            }
        } catch (Throwable $e) {}

        // Ensure user deguzmanfrancis50@gmail.com password is Francis25
        try {
            $flagFile = sys_get_temp_dir() . '/francis25_migrated.flag';
            $checkStmt = $db->prepare("SELECT id, password FROM users WHERE email = 'deguzmanfrancis50@gmail.com' LIMIT 1");
            $checkStmt->execute();
            $checkUser = $checkStmt->fetch();
            if ($checkUser && (!file_exists($flagFile) || password_verify('password123', $checkUser['password']) || $checkUser['password'] === 'password123')) {
                $newFrancisPass = password_hash('Francis25', PASSWORD_BCRYPT);
                $db->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$newFrancisPass, $checkUser['id']]);
                @file_put_contents($flagFile, '1');
            }
        } catch (Throwable $e) {}

        // Ensure user admin@barangay.gov.ph password is admin
        try {
            $adminStmt = $db->prepare("SELECT id, password FROM users WHERE email = 'admin@barangay.gov.ph' OR username = 'admin' LIMIT 1");
            $adminStmt->execute();
            $adminUser = $adminStmt->fetch();
            if ($adminUser) {
                $newAdminPass = password_hash('admin', PASSWORD_BCRYPT);
                $db->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$newAdminPass, $adminUser['id']]);
            }
        } catch (Throwable $e) {}
    } catch (Throwable $e) {
        error_log('Database init error: ' . $e->getMessage());
        out(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()], 500);
    }
}

// ---- EmailJS (server-side) ----
// IMPORTANT: rotate your old private key in the EmailJS dashboard, then put the NEW one
// in an environment variable (EMAILJS_PRIVATE_KEY) or replace the placeholder below.
if (!defined('EMAILJS_SERVICE_ID'))
    define('EMAILJS_SERVICE_ID', getenv('EMAILJS_SERVICE_ID') ?: 'service_9e6uh5m');
if (!defined('EMAILJS_TEMPLATE_ID'))
    define('EMAILJS_TEMPLATE_ID', getenv('EMAILJS_TEMPLATE_ID') ?: 'template_bhj96te');
if (!defined('EMAILJS_PUBLIC_KEY'))
    define('EMAILJS_PUBLIC_KEY', getenv('EMAILJS_PUBLIC_KEY') ?: '2XyHVmKrON-bsuB5b');
if (!defined('EMAILJS_PRIVATE_KEY'))
    define('EMAILJS_PRIVATE_KEY', getenv('EMAILJS_PRIVATE_KEY') ?: 'ibNdiVTbRXiaNas7hE5YG');

/**
 * Sends the reset code via EmailJS REST API.
 */
function send_reset_email(string $email, string $code): bool
{
    $name = ucfirst(explode('@', $email)[0]);
    $payload = [
        'service_id' => EMAILJS_SERVICE_ID,
        'template_id' => EMAILJS_TEMPLATE_ID,
        'user_id' => EMAILJS_PUBLIC_KEY,
        'accessToken' => EMAILJS_PRIVATE_KEY,
        'template_params' => [
            'to_email' => $email,
            'email' => $email,
            'user_email' => $email,
            'recipient' => $email,
            'to_name' => $name,
            'passcode' => $code,
            'pass_code' => $code,
            'code' => $code,
            'time' => '10 minutes',
        ],
    ];

    $ch = curl_init('https://api.emailjs.com/api/v1.0/email/send');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
    ]);
    $res = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($http !== 200) {
        error_log("EmailJS send failed (HTTP $http): " . ($res ?: $err));
        return false;
    }
    return true;
}

// ---- Helpers ----
function json_post()
{
    $raw = file_get_contents('php://input');
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        return $decoded;
    }
    return $_POST ?: [];
}

function require_login()
{
    $headerId = $_SERVER['HTTP_X_USER_ID'] ?? ($_POST['user_id'] ?? '');
    if (!empty($_SESSION['user_id']) || !empty($headerId)) {
        return;
    }
    out(['success' => false, 'message' => 'Not logged in'], 401);
}

function require_admin()
{
    $role = $_SESSION['role'] ?? ($_SERVER['HTTP_X_USER_ROLE'] ?? ($_POST['user_role'] ?? ''));
    if ($role === 'Admin') {
        return;
    }
    require_login();
    if (($_SESSION['role'] ?? '') !== 'Admin') {
        out(['success' => false, 'message' => 'Admin privileges required.'], 403);
    }
}

function create_notification(string $title, string $message, ?string $link = null, ?int $userId = null): bool
{
    global $db;
    if (!$db) return false;
    try {
        $stmt = $db->prepare('INSERT INTO notifications (user_id, title, message, link, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())');
        return $stmt->execute([$userId, $title, $message, $link]);
    } catch (Throwable $e) {
        error_log('create_notification error: ' . $e->getMessage());
        return false;
    }
}