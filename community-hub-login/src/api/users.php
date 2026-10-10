<?php
require 'config.php';

// Prevent warnings in JSON response
ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    // Ensure avatar, is_online, and last_active columns exist
    try {
        $checkAvatar = $db->query("SHOW COLUMNS FROM users LIKE 'avatar'");
        if ($checkAvatar->rowCount() == 0) {
            $db->exec("ALTER TABLE users ADD COLUMN avatar LONGTEXT DEFAULT NULL");
        }
    } catch (Throwable $e) {}

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

    // Auto-mark inactive users (>3 mins) as offline
    $threshold = date('Y-m-d H:i:s', strtotime('-3 minutes'));
    try {
        $db->prepare("UPDATE users SET is_online = 0 WHERE last_active < ? AND is_online = 1")->execute([$threshold]);
    } catch (Throwable $e) {}

    $stmt = $db->query('SELECT id, username, email, role, avatar, COALESCE(is_online, 0) as is_online, last_active FROM users ORDER BY id DESC');
    $users = $stmt->fetchAll();

    out([
        'success' => true,
        'count' => count($users),
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
} catch (Throwable $e) {
    error_log('Fetch users failed: ' . $e->getMessage());
    out(['success' => false, 'error' => 'Failed to fetch registered users from database.'], 500);
}
