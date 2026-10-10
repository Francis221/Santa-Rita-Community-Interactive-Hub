<?php
require 'config.php';

// Never print PHP warnings/notices into the response: they break JSON parsing.
ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    $in = json_post();
    $username = trim($in['username'] ?? '');
    $email = trim($in['email'] ?? '');
    $password = $in['password'] ?? '';
    $photo = $in['photo'] ?? null;
    $errors = [];

    // Validate the photo (must be an image data URL, and not huge)
    if ($photo !== null && $photo !== '') {
        if (!is_string($photo) || !preg_match('#^data:image/(png|jpe?g|gif|webp);base64,#i', $photo)) {
            $errors[] = 'Profile photo must be a valid image.';
        } elseif (strlen($photo) > 3 * 1024 * 1024) {
            $errors[] = 'Profile photo is too large.';
        }
    } else {
        $photo = null;
    }

    if (!preg_match('/^[A-Za-z0-9_]{3,50}$/', $username)) {
        $errors[] = 'Username must be 3–50 characters: letters, numbers or underscore.';
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 100) {
        $errors[] = 'Enter a valid email address.';
    }
    if (!is_string($password) || strlen($password) < 8) {
        $errors[] = 'Password must be at least 8 characters.';
    }

    if (!$errors) {
        // Ensure avatar column exists in users table safely
        try {
            if ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
                $db->exec("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT NULL");
            } else {
                $checkAvatar = $db->query("SHOW COLUMNS FROM users LIKE 'avatar'");
                if ($checkAvatar->rowCount() == 0) {
                    $db->exec("ALTER TABLE users ADD COLUMN avatar LONGTEXT DEFAULT NULL");
                }
            }
        } catch (Throwable $e) {}

        // Duplicate check
        $s = $db->prepare('SELECT username, email FROM users WHERE username = ? OR email = ?');
        $s->execute([$username, $email]);
        foreach ($s->fetchAll() as $r) {
            if (strcasecmp($r['username'], $username) === 0)
                $errors[] = 'That username is taken.';
            if (strcasecmp($r['email'], $email) === 0)
                $errors[] = 'That email is already registered.';
        }
    }

    if ($errors) {
        out(['error' => $errors[0], 'errors' => array_values(array_unique($errors))], 422);
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $savedAvatar = $photo;

    try {
        $stmt = $db->prepare("INSERT INTO users (username, email, password, role, avatar) VALUES (?, ?, ?, 'Resident', ?)");
        $stmt->execute([$username, $email, $hashedPassword, $photo]);
    } catch (Throwable $insertEx) {
        // Fallback without avatar column in case avatar column is missing or failed
        $stmt = $db->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'Resident')");
        $stmt->execute([$username, $email, $hashedPassword]);
        $savedAvatar = null;
    }

    $newId = (int)$db->lastInsertId();

    out([
        'ok' => true,
        'message' => 'Account created successfully!',
        'user' => [
            'id' => $newId,
            'username' => $username,
            'email' => $email,
            'role' => 'Resident',
            'avatar' => $savedAvatar
        ]
    ], 201);

} catch (Throwable $e) {
    error_log('Register failed: ' . $e->getMessage());
    out(['error' => 'Could not create account: ' . $e->getMessage()], 500);
}