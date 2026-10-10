<?php
require 'config.php';

// Prevent notices in JSON response
ini_set('display_errors', '0');
error_reporting(E_ALL);

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
} catch (Throwable $e) {
    error_log('login_logs table setup notice: ' . $e->getMessage());
}

$action = $_GET['action'] ?? $_POST['action'] ?? 'summary';

if ($action === 'log') {
    $input = json_post();
    $userId = $input['user_id'] ?? $_SESSION['user_id'] ?? null;
    $username = $input['username'] ?? $_SESSION['username'] ?? 'Guest';
    $role = $input['role'] ?? $_SESSION['role'] ?? 'Resident';

    if ($userId) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $stmt = $db->prepare('INSERT INTO login_logs (user_id, username, role, ip_address, user_agent, login_time) VALUES (?, ?, ?, ?, ?, NOW())');
        $stmt->execute([$userId, $username, $role, $ip, $ua]);
    }

    out(['success' => true]);
} elseif ($action === 'list') {
    $stmt = $db->query('SELECT id, user_id, username, role, ip_address, login_time FROM login_logs ORDER BY id DESC LIMIT 50');
    $logs = $stmt->fetchAll();

    out([
        'success' => true,
        'count' => count($logs),
        'logs' => array_map(function($l) {
            return [
                'id' => (int)$l['id'],
                'user_id' => (int)$l['user_id'],
                'username' => $l['username'],
                'role' => $l['role'],
                'ip_address' => $l['ip_address'],
                'login_time' => date('M d, Y h:i A', strtotime($l['login_time']))
            ];
        }, $logs)
    ]);
} else {
    // Action 'summary' - Real-time statistics summary
    $totalUsers = (int)$db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $onlineUsers = (int)$db->query("SELECT COUNT(*) FROM users WHERE is_online = 1")->fetchColumn();
    if ($onlineUsers < 1 && !empty($_SESSION['user_id'])) $onlineUsers = 1;

    $loginsToday = (int)$db->query("SELECT COUNT(*) FROM login_logs WHERE DATE(login_time) = CURDATE()")->fetchColumn();
    $totalLogins = (int)$db->query("SELECT COUNT(*) FROM login_logs")->fetchColumn();

    $latestStmt = $db->query("SELECT id, username, role, login_time FROM login_logs ORDER BY id DESC LIMIT 5");
    $latestLogins = $latestStmt->fetchAll();

    out([
        'success' => true,
        'stats' => [
            'total_users' => $totalUsers,
            'online_users' => max(1, $onlineUsers),
            'logins_today' => $loginsToday,
            'total_logins' => $totalLogins,
            'latest_logins' => array_map(function($l) {
                return [
                    'id' => (int)$l['id'],
                    'username' => $l['username'],
                    'role' => $l['role'],
                    'time' => date('h:i A', strtotime($l['login_time'])),
                    'date' => date('M d, Y', strtotime($l['login_time']))
                ];
            }, $latestLogins)
        ]
    ]);
}
