<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mailer.php';

$in = json_post();
$email = trim(filter_var($in['email'] ?? '', FILTER_SANITIZE_EMAIL));

$genericMessage = 'If the email is registered, a verification code has been sent.';

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    out(['success' => true, 'message' => $genericMessage]);
}

try {
    $stmt = $db->prepare('SELECT id, email FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        out(['success' => false, 'message' => 'Email address is not registered in our database. Please check spelling or create an account.'], 400);
    }

    // Generate secure 6-digit verification code
    $code = (string) random_int(100000, 999999);

    // Store code & set expiration 10 minutes into the future using MySQL NOW()
    $update = $db->prepare('UPDATE users SET reset_code = ?, reset_code_expires = DATE_ADD(NOW(), INTERVAL 10 MINUTE), reset_verified = 0, reset_attempts = 0 WHERE id = ?');
    $update->execute([$code, $user['id']]);

    // Send email via EmailJS API
    $mailRes = sendResetCodeEmail($user['email'], $code);

    out([
        'success' => true,
        'message' => 'A 6-digit verification code has been sent to ' . $user['email'],
        'code' => $code,
        'backend_sent' => $mailRes['success'] ?? false,
    ]);
} catch (Exception $e) {
    error_log("Forgot password DB error: " . $e->getMessage());
    out(['success' => false, 'message' => 'Server error processing request.'], 500);
}
