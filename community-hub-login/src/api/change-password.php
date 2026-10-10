<?php
require_once __DIR__ . '/config.php';

// Prevent notices in JSON response
ini_set('display_errors', '0');
error_reporting(E_ALL);

$in = json_post();
$currentPassword = $in['current_password'] ?? $in['currentPassword'] ?? '';
$newPassword = $in['new_password'] ?? $in['newPassword'] ?? '';
$emailInput = trim($in['email'] ?? $in['login'] ?? '');
$userId = $_SESSION['user_id'] ?? null;

if (empty($currentPassword) || empty($newPassword)) {
    out(['success' => false, 'message' => 'Current password and new password are required.'], 400);
}

if (strlen($newPassword) < 6) {
    out(['success' => false, 'message' => 'New password must be at least 6 characters long.'], 400);
}

try {
    $user = null;

    if ($userId) {
        $stmt = $db->prepare('SELECT id, password, email, username FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
    }

    if (!$user && $emailInput !== '') {
        $stmt = $db->prepare('SELECT id, password, email, username FROM users WHERE email = ? OR username = ? LIMIT 1');
        $stmt->execute([$emailInput, $emailInput]);
        $user = $stmt->fetch();
    }

    if (!$user) {
        out(['success' => false, 'message' => 'User account not found. Please log in again.'], 401);
    }

    // Verify current password
    $info = password_get_info($user['password']);
    $ok = false;
    if (empty($info['algo']) || $info['algoName'] === 'unknown') {
        $ok = hash_equals($user['password'], $currentPassword);
    } else {
        $ok = password_verify($currentPassword, $user['password']);
    }

    if (!$ok) {
        out(['success' => false, 'message' => 'Current password is incorrect. Please check spelling.'], 400);
    }

    // Update to new hashed password
    $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
    $up = $db->prepare('UPDATE users SET password = ? WHERE id = ?');
    $up->execute([$hashed, $user['id']]);

    out([
        'success' => true,
        'message' => 'Password changed successfully!'
    ]);
} catch (Throwable $e) {
    error_log("Change password error: " . $e->getMessage());
    out(['success' => false, 'message' => 'Failed to change password: ' . $e->getMessage()], 500);
}
