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

    // Ensure reset columns exist
    try { $db->exec("ALTER TABLE users ADD COLUMN reset_code VARCHAR(10) DEFAULT NULL"); } catch (Throwable $e) {}
    try { $db->exec("ALTER TABLE users ADD COLUMN reset_code_expires DATETIME DEFAULT NULL"); } catch (Throwable $e) {}
    try { $db->exec("ALTER TABLE users ADD COLUMN reset_verified INT DEFAULT 0"); } catch (Throwable $e) {}
    try { $db->exec("ALTER TABLE users ADD COLUMN reset_attempts INT DEFAULT 0"); } catch (Throwable $e) {}

    // Generate secure 6-digit verification code
    $code = (string) random_int(100000, 999999);

    // Store code & set expiration 10 minutes into the future
    $expires = date('Y-m-d H:i:s', strtotime('+10 minutes'));
    $update = $db->prepare('UPDATE users SET reset_code = ?, reset_code_expires = ?, reset_verified = 0, reset_attempts = 0 WHERE id = ?');
    $update->execute([$code, $expires, $user['id']]);

    // Send email via EmailJS API (catch errors gracefully)
    $mailSent = false;
    try {
        $mailRes = sendResetCodeEmail($user['email'], $code);
        $mailSent = $mailRes['success'] ?? false;
    } catch (Throwable $e) {
        error_log('EmailJS notice: ' . $e->getMessage());
    }

    out([
        'success' => true,
        'message' => 'A 6-digit verification code has been generated for ' . $user['email'],
        'code' => $code,
        'backend_sent' => $mailSent,
    ]);
} catch (Throwable $e) {
    error_log("Forgot password DB error: " . $e->getMessage());
    out(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
}
