<?php
require 'config.php';
$in = json_post();
$login = trim($in['login'] ?? '');
$password = $in['password'] ?? '';

$s = $db->prepare('SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1');
$s->execute([$login, $login]);
$u = $s->fetch();

$ok = false;
if ($u) {
    $info = password_get_info($u['password']);
    if (empty($info['algo']) || $info['algoName'] === 'unknown') {
        $ok = hash_equals($u['password'], $password);          // legacy plain text (e.g. "123456")
    } else {
        $ok = password_verify($password, $u['password']);
    }
    if ($ok && password_needs_rehash($u['password'], PASSWORD_DEFAULT)) {
        $db->prepare('UPDATE users SET password = ? WHERE id = ?')
           ->execute([password_hash($password, PASSWORD_DEFAULT), $u['id']]);
    }
}
if (!$ok) out(['error' => 'Wrong username/email or password.'], 401);

session_regenerate_id(true);
$_SESSION['user_id'] = $u['id'];
$_SESSION['username'] = $u['username'];
$_SESSION['role'] = $u['role'] ?? 'Resident';

try {
    // Ensure login_logs table exists
    $db->exec("CREATE TABLE IF NOT EXISTS login_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        username VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'Resident',
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id),
        INDEX (login_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Mark logging-in user as online with current timestamp
    $db->prepare('UPDATE users SET is_online = 1, last_active = NOW() WHERE id = ?')->execute([$u['id']]);

    // Record login in login_logs
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $logStmt = $db->prepare('INSERT INTO login_logs (user_id, username, role, ip_address, user_agent, login_time) VALUES (?, ?, ?, ?, ?, NOW())');
    $logStmt->execute([$u['id'], $u['username'], $u['role'] ?? 'Resident', $ip, $ua]);
} catch (Throwable $e) {}

out(['user' => [
    'id' => (int)$u['id'],
    'username' => $u['username'],
    'email' => $u['email'],
    'role' => $u['role'] ?? 'Resident',
    'avatar' => $u['avatar'] ?? null
]]);
