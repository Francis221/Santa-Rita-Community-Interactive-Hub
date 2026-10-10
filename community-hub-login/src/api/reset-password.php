<?php
require_once __DIR__ . '/config.php';

$in = json_post();
$email = trim(filter_var($in['email'] ?? '', FILTER_SANITIZE_EMAIL));
$code = trim($in['code'] ?? '');
$newPassword = $in['new_password'] ?? $in['newPassword'] ?? '';

if (empty($email) || empty($code) || empty($newPassword)) {
    out(['success' => false, 'message' => 'Missing required fields.'], 400);
}

if (strlen($newPassword) < 6) {
    out(['success' => false, 'message' => 'Password must be at least 6 characters long.'], 400);
}

try {
    $stmt = $db->prepare('SELECT id, reset_code, reset_code_expires, reset_verified FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || empty($user['reset_code'])) {
        out(['success' => false, 'message' => 'Invalid or expired password reset session.'], 400);
    }

    if ((int)$user['reset_verified'] !== 1 || $user['reset_code'] !== $code) {
        out(['success' => false, 'message' => 'Verification step required.'], 400);
    }

    $expiresAt = strtotime($user['reset_code_expires']);
    if (!$expiresAt || $expiresAt < time()) {
        out(['success' => false, 'message' => 'Verification code has expired. Please request a new one.'], 400);
    }

    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    $update = $db->prepare('UPDATE users SET password = ?, reset_code = NULL, reset_code_expires = NULL, reset_verified = 0, reset_attempts = 0 WHERE id = ?');
    $update->execute([$hashedPassword, $user['id']]);

    out([
        'success' => true,
        'message' => 'Password reset successfully'
    ]);
} catch (Exception $e) {
    error_log("Reset password error: " . $e->getMessage());
    out(['success' => false, 'message' => 'Failed to reset password.'], 500);
}
