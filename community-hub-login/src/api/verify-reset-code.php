<?php
require_once __DIR__ . '/config.php';

$in = json_post();
$email = trim(filter_var($in['email'] ?? '', FILTER_SANITIZE_EMAIL));
$code = preg_replace('/\D/', '', (string) ($in['code'] ?? ''));

if ($email === '' || $code === '') {
    out(['success' => false, 'message' => 'Email address and verification code are required.'], 400);
}

$invalid = 'Invalid or expired verification code.';

try {
    $stmt = $db->prepare(
        'SELECT id, reset_code, reset_attempts, (reset_code_expires >= NOW()) AS is_valid_time
           FROM users WHERE email = ? LIMIT 1'
    );
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Unknown email or no active code: same generic message (no enumeration)
    if (!$user || empty($user['reset_code'])) {
        out(['success' => false, 'message' => $invalid], 400);
    }

    if ((int) $user['reset_attempts'] >= 5) {
        out(['success' => false, 'message' => 'Too many failed attempts. Please request a new code.'], 400);
    }

    if ((int) ($user['is_valid_time'] ?? 0) !== 1) {
        out(['success' => false, 'message' => 'Verification code has expired. Please click Resend Code.'], 400);
    }

    if (!hash_equals((string) $user['reset_code'], $code)) {
        $inc = $db->prepare('UPDATE users SET reset_attempts = reset_attempts + 1 WHERE id = ?');
        $inc->execute([$user['id']]);
        out(['success' => false, 'message' => 'Incorrect verification code. Please check your email and try again.'], 400);
    }

    $mark = $db->prepare('UPDATE users SET reset_verified = 1 WHERE id = ?');
    $mark->execute([$user['id']]);

    out(['success' => true, 'message' => 'Verification code verified successfully']);
} catch (Exception $e) {
    error_log('Verify reset code error: ' . $e->getMessage());
    out(['success' => false, 'message' => 'An error occurred during verification.'], 500);
}