<?php
require_once __DIR__ . '/config.php';

echo "=== TESTING END-TO-END RESET FLOW ===\n\n";

$email = 'deguzmanfrancis50@gmail.com';
$code = (string) random_int(100000, 999999);

echo "1. Generating code {$code} for {$email} in MySQL using NOW() + 10 MIN...\n";
$update = $db->prepare('UPDATE users SET reset_code = ?, reset_code_expires = DATE_ADD(NOW(), INTERVAL 10 MINUTE), reset_verified = 0, reset_attempts = 0 WHERE email = ?');
$update->execute([$code, $email]);

echo "2. Querying MySQL to check expiration status...\n";
$stmt = $db->prepare('SELECT id, reset_code, reset_code_expires, (reset_code_expires >= NOW()) AS is_valid_time FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

print_r($user);

if ($user['is_valid_time'] == 1 && $user['reset_code'] === $code) {
    echo "\n[SUCCESS] Code is VALID and NOT EXPIRED! MySQL time check passed 100%!\n";
} else {
    echo "\n[ERROR] Code validation failed!\n";
}
