<?php
require 'config.php';

ini_set('display_errors', '0');
error_reporting(E_ALL);

// Apply WAL mode for SQLite to prevent database locks
try {
    if ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
        $db->exec('PRAGMA journal_mode=WAL');
        $db->exec('PRAGMA busy_timeout=10000');
    }
} catch (Throwable $e) {}

$action = $_GET['action'] ?? $_POST['action'] ?? 'status';
$currentUserId = $_SESSION['user_id'] ?? null;
$now = date('Y-m-d H:i:s');
$threshold = date('Y-m-d H:i:s', time() - 300); // 5 minutes

if ($action === 'heartbeat') {
    $username = $_REQUEST['username'] ?? null;

    if (!$currentUserId && $username) {
        try {
            $uStmt = $db->prepare('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1');
            $uStmt->execute([$username, $username]);
            $uRow = $uStmt->fetch();
            if ($uRow) $currentUserId = $uRow['id'];
        } catch (Throwable $e) {}
    }

    if ($currentUserId) {
        try {
            $db->prepare('UPDATE users SET is_online = 1, last_active = ? WHERE id = ?')
               ->execute([$now, $currentUserId]);
        } catch (Throwable $e) {}
    }

    try {
        $db->prepare('UPDATE users SET is_online = 0 WHERE last_active < ? AND is_online = 1')
           ->execute([$threshold]);
    } catch (Throwable $e) {}

    $onlineCount = 0;
    try {
        $onlineCount = (int)$db->query('SELECT COUNT(*) FROM users WHERE is_online = 1')->fetchColumn();
    } catch (Throwable $e) {}

    out(['success' => true, 'online_count' => $onlineCount, 'user_id' => $currentUserId, 'timestamp' => $now]);

} elseif ($action === 'toggle') {
    $input = json_post();
    $targetId = $input['id'] ?? $_REQUEST['id'] ?? null;
    $targetName = $input['username'] ?? $_REQUEST['username'] ?? null;

    if (!$targetId && $targetName) {
        try {
            $uStmt = $db->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
            $uStmt->execute([$targetName]);
            $uRow = $uStmt->fetch();
            if ($uRow) $targetId = $uRow['id'];
        } catch (Throwable $e) {}
    }

    if ($targetId) {
        try {
            // SQLite-compatible toggle (avoids IF() function)
            $cur = $db->prepare('SELECT is_online FROM users WHERE id = ?');
            $cur->execute([$targetId]);
            $row = $cur->fetch();
            $newVal = ($row && (int)$row['is_online'] === 1) ? 0 : 1;
            $db->prepare('UPDATE users SET is_online = ?, last_active = ? WHERE id = ?')
               ->execute([$newVal, $now, $targetId]);
        } catch (Throwable $e) {}
    }

    $onlineCount = 0;
    try {
        $onlineCount = (int)$db->query('SELECT COUNT(*) FROM users WHERE is_online = 1')->fetchColumn();
    } catch (Throwable $e) {}

    out(['success' => true, 'online_count' => $onlineCount]);

} else {
    // Action 'status' — return user list with real-time online flags
    try {
        $db->prepare('UPDATE users SET is_online = 0 WHERE last_active < ? AND is_online = 1')
           ->execute([$threshold]);
    } catch (Throwable $e) {}

    $users = [];
    try {
        $stmt = $db->query('SELECT id, username, email, role, avatar, COALESCE(is_online, 0) as is_online, last_active FROM users ORDER BY id DESC');
        $users = $stmt->fetchAll();
    } catch (Throwable $e) {}

    $onlineCount = count(array_filter($users, fn($u) => (int)$u['is_online'] === 1));

    out([
        'success'      => true,
        'online_count' => $onlineCount,
        'users'        => array_map(fn($u) => [
            'id'          => (int)$u['id'],
            'username'    => $u['username'],
            'email'       => $u['email'],
            'role'        => $u['role'] ?? 'Resident',
            'avatar'      => $u['avatar'],
            'is_online'   => (bool)$u['is_online'],
            'last_active' => $u['last_active'],
        ], $users),
    ]);
}
