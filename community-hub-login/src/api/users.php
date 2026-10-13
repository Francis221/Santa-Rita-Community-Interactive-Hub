<?php
require 'config.php';

ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    // Add missing columns safely (works on both MySQL and SQLite via try/catch)
    try { $db->exec("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT NULL"); } catch (Throwable $e) {}
    try { $db->exec("ALTER TABLE users ADD COLUMN is_online INTEGER DEFAULT 0"); } catch (Throwable $e) {}
    try { $db->exec("ALTER TABLE users ADD COLUMN last_active DATETIME DEFAULT CURRENT_TIMESTAMP"); } catch (Throwable $e) {}

    // Apply WAL mode for SQLite to prevent locks
    try {
        if ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
            $db->exec('PRAGMA journal_mode=WAL');
            $db->exec('PRAGMA busy_timeout=10000');
        }
    } catch (Throwable $e) {}

    // Auto-mark inactive users (>5 mins) as offline
    $threshold = date('Y-m-d H:i:s', time() - 300);
    try {
        $db->prepare("UPDATE users SET is_online = 0 WHERE last_active < ? AND is_online = 1")->execute([$threshold]);
    } catch (Throwable $e) {}

    $stmt = $db->query('SELECT id, username, email, role, avatar, COALESCE(is_online, 0) as is_online, last_active FROM users ORDER BY id DESC');
    $users = $stmt->fetchAll();

    out([
        'success' => true,
        'count'   => count($users),
        'users'   => array_map(function($u) {
            return [
                'id'          => (int)$u['id'],
                'username'    => $u['username'],
                'email'       => $u['email'],
                'role'        => $u['role'] ?? 'Resident',
                'avatar'      => $u['avatar'],
                'is_online'   => (bool)$u['is_online'],
                'last_active' => $u['last_active'],
            ];
        }, $users),
    ]);
} catch (Throwable $e) {
    error_log('Fetch users failed: ' . $e->getMessage());
    out(['success' => false, 'error' => 'Failed to fetch users.'], 500);
}
