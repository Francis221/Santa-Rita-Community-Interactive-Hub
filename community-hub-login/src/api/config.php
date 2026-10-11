<?php
// ---- Keep PHP warnings/notices out of JSON responses ----
ini_set('display_errors', '0');
ini_set('log_errors', '1');
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

// ---- CORS: Allow Vercel, localhost, and custom domains ----
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
if ($origin !== '*') {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    header("Access-Control-Allow-Origin: *");
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
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
$isLocalhost = in_array($_SERVER['SERVER_NAME'] ?? '', ['127.0.0.1', 'localhost']) || (php_sapi_name() === 'cli' && empty(getenv('DB_HOST')));

$db = null;

if ($isLocalhost && !getenv('DB_HOST')) {
    $dbHost = '127.0.0.1';
    $dbName = 'login_system';
    $dbUser = 'root';
    $dbPass = '';
    $dbPort = '3306';
} else {
    // InfinityFree Live Cloud MySQL Details
    $dbHost = getenv('DB_HOST') ?: 'sql302.infinityfree.com';
    $dbName = getenv('DB_NAME') ?: 'if0_43140654_login_system';
    $dbUser = getenv('DB_USER') ?: 'if0_43140654';
    $dbPass = getenv('DB_PASS') !== false && getenv('DB_PASS') !== '' ? getenv('DB_PASS') : 'tr2Rcq8LuP7tX';
    $dbPort = getenv('DB_PORT') ?: '3306';
}

// 1. Try MySQL Connection
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

// 2. High-Availability SQLite Database Fallback
if (!$db) {
    try {
        $sqlitePath = sys_get_temp_dir() . '/login_system.sqlite';
        $isNewDb = !file_exists($sqlitePath);
        $db = new PDO('sqlite:' . $sqlitePath, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

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

        // Migration: Ensure reset password columns exist in SQLite users table
        try { $db->exec("ALTER TABLE users ADD COLUMN reset_code TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN reset_code_expires DATETIME DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN reset_verified INTEGER DEFAULT 0"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN reset_attempts INTEGER DEFAULT 0"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN description TEXT DEFAULT NULL"); } catch (Throwable $e) {}

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
    define('EMAILJS_SERVICE_ID', 'service_9e6uh5m');
if (!defined('EMAILJS_TEMPLATE_ID'))
    define('EMAILJS_TEMPLATE_ID', 'template_bhj96te');
if (!defined('EMAILJS_PUBLIC_KEY'))
    define('EMAILJS_PUBLIC_KEY', '2XyHVmKrON-bsuB5b');
if (!defined('EMAILJS_PRIVATE_KEY'))
    define('EMAILJS_PRIVATE_KEY', 'ibNdiVTbRXiaNas7hE5YG');

/**
 * Sends the reset code via EmailJS REST API. Requires
 * "Allow EmailJS API for non-browser applications" to be enabled in
 * EmailJS dashboard -> Account -> Security.
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
    if (empty($_SESSION['user_id']))
        out(['success' => false, 'message' => 'Not logged in'], 401);
}