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
$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbName = getenv('DB_NAME') ?: 'login_system';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$dbPort = getenv('DB_PORT') ?: '3306';

try {
    $db = new PDO("mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    // Make MySQL NOW() match Asia/Manila (UTC+8) so expiry checks are consistent
    $db->exec("SET time_zone = '+08:00'");
} catch (PDOException $e) {
    error_log('DB connection failed: ' . $e->getMessage());
    out(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()], 500);
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
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST')
        out(['success' => false, 'message' => 'POST only'], 405);
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) {
        out(['success' => false, 'message' => 'JSON required'], 415);
    }
    return json_decode(file_get_contents('php://input'), true) ?: [];
}

function require_login()
{
    if (empty($_SESSION['user_id']))
        out(['success' => false, 'message' => 'Not logged in'], 401);
}