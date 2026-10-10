<?php
require 'config.php';

// Prevent warnings in JSON output
ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    // Ensure is_online and last_active columns exist in users table
    try {
        $checkCol = $db->query("SHOW COLUMNS FROM users LIKE 'is_online'");
        if ($checkCol->rowCount() == 0) {
            $db->exec("ALTER TABLE users ADD COLUMN is_online TINYINT(1) DEFAULT 0");
        }
    } catch (Throwable $e) {}

    try {
        $checkActive = $db->query("SHOW COLUMNS FROM users LIKE 'last_active'");
        if ($checkActive->rowCount() == 0) {
            $db->exec("ALTER TABLE users ADD COLUMN last_active DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        }
    } catch (Throwable $e) {}
} catch (Throwable $e) {
    error_log('Online table schema setup notice: ' . $e->getMessage());
}

$action = $_GET['action'] ?? $_POST['action'] ?? 'status';
$currentUserId = $_SESSION['user_id'] ?? null;

// Handle Heartbeat (Keep Active User Online)
if ($action === 'heartbeat') {
    $username = $_REQUEST['username'] ?? null;

    if (!$currentUserId && $username) {
        $uStmt = $db->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
        $uStmt->execute([$username]);
        $uRow = $uStmt->fetch();
        if ($uRow) $currentUserId = $uRow['id'];
    }

    if ($currentUserId) {
        $stmt = $db->prepare('UPDATE users SET is_online = 1, last_active = NOW() WHERE id = ?');
        $stmt->execute([$currentUserId]);
    }

    // Auto-mark users inactive for > 3 minutes as offline
    $threshold = date('Y-m-d H:i:s', strtotime('-3 minutes'));
    try {
        $db->prepare("UPDATE users SET is_online = 0 WHERE last_active < ? AND is_online = 1")->execute([$threshold]);
    } catch (Throwable $e) {}

    // Get current online count
    $onlineCount = (int)$db->query("SELECT COUNT(*) FROM users WHERE is_online = 1")->fetchColumn();
    if ($onlineCount < 1 && $currentUserId) $onlineCount = 1;

    out([
        'success' => true,
        'online_count' => $onlineCount,
        'user_id' => $currentUserId,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} elseif ($action === 'toggle') {
    $input = json_post();
    $targetId = $input['id'] ?? $_REQUEST['id'] ?? null;
    $targetName = $input['username'] ?? $_REQUEST['username'] ?? null;

    if (!$targetId && $targetName) {
        $uStmt = $db->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
        $uStmt->execute([$targetName]);
        $uRow = $uStmt->fetch();
        if ($uRow) $targetId = $uRow['id'];
    }

    if ($targetId) {
        $tStmt = $db->prepare('UPDATE users SET is_online = IF(is_online = 1, 0, 1), last_active = NOW() WHERE id = ?');
        $tStmt->execute([$targetId]);
    }

    $onlineCount = (int)$db->query("SELECT COUNT(*) FROM users WHERE is_online = 1")->fetchColumn();

    out([
        'success' => true,
        'online_count' => max(1, $onlineCount)
    ]);
} else {
    // Action 'status' - Fetch all users and real-time online count
    // Auto-clean stale online sessions first
    $threshold = date('Y-m-d H:i:s', strtotime('-3 minutes'));
    try {
        $db->prepare("UPDATE users SET is_online = 0 WHERE last_active < ? AND is_online = 1")->execute([$threshold]);
    } catch (Throwable $e) {}

    $stmt = $db->query('SELECT id, username, email, role, avatar, is_online, last_active FROM users ORDER BY id DESC');
    $users = $stmt->fetchAll();

    $onlineUsers = array_filter($users, function($u) {
        return (int)$u['is_online'] === 1;
    });

    $count = count($onlineUsers);
    if ($count < 1 && $currentUserId) $count = 1;

    out([
        'success' => true,
        'online_count' => max(1, $count),
        'users' => array_map(function($u) {
            return [
                'id' => (int)$u['id'],
                'username' => $u['username'],
                'email' => $u['email'],
                'role' => $u['role'] ?? 'Resident',
                'avatar' => $u['avatar'],
                'is_online' => (bool)$u['is_online'],
                'last_active' => $u['last_active']
            ];
        }, $users)
    ]);
}
