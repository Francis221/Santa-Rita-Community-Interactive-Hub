<?php
require 'config.php';

// Never print PHP warnings/notices into the response: they break JSON parsing.
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Enable WAL mode to prevent "database is locked" on SQLite (Render free tier)
try {
    if ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
        $db->exec('PRAGMA journal_mode=WAL');
        $db->exec('PRAGMA busy_timeout=5000');
    }
} catch (Throwable $e) {}

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
        // Ensure avatar column exists — works on both MySQL and SQLite
        try { $db->exec("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN is_online INTEGER DEFAULT 0"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE users ADD COLUMN last_active DATETIME DEFAULT CURRENT_TIMESTAMP"); } catch (Throwable $e) {}

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
    $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
    $isSQLite = ($driver === 'sqlite');
    $isPgSQL  = ($driver === 'pgsql');

    // Serialize concurrent registrations with OS file lock
    $lockFile = sys_get_temp_dir() . '/db_write.lock';
    $lock = fopen($lockFile, 'w+');
    if ($lock) flock($lock, LOCK_EX);

    $inserted = false;
    $lastError = null;
    $newId = null;

    for ($attempt = 0; $attempt < 5; $attempt++) {
        try {
            if ($isSQLite) {
                $db->exec('BEGIN IMMEDIATE');
            } else {
                $db->beginTransaction();
            }

            if ($isPgSQL) {
                // PostgreSQL: use RETURNING to get inserted ID reliably
                $stmt = $db->prepare("INSERT INTO users (username, email, password, role, avatar) VALUES (?, ?, ?, 'Resident', ?) RETURNING id");
                $stmt->execute([$username, $email, $hashedPassword, $photo]);
                $row = $stmt->fetch();
                $newId = (int)($row['id'] ?? 0);
            } else {
                try {
                    $stmt = $db->prepare("INSERT INTO users (username, email, password, role, avatar) VALUES (?, ?, ?, 'Resident', ?)");
                    $stmt->execute([$username, $email, $hashedPassword, $photo]);
                } catch (Throwable $colErr) {
                    $stmt = $db->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'Resident')");
                    $stmt->execute([$username, $email, $hashedPassword]);
                    $savedAvatar = null;
                }
                $newId = (int)$db->lastInsertId();
            }

            if ($isSQLite) {
                $db->exec('COMMIT');
            } else {
                $db->commit();
            }
            $inserted = true;
            break;

        } catch (Throwable $ex) {
            try {
                if ($isSQLite) { $db->exec('ROLLBACK'); } else { $db->rollBack(); }
            } catch (Throwable $r) {}
            $lastError = $ex;
            // Retry only on lock errors
            if (strpos($ex->getMessage(), 'locked') !== false && $attempt < 4) {
                usleep(800000 * ($attempt + 1));
                continue;
            }
            break;
        }
    }

    // Release file lock
    if ($lock) { flock($lock, LOCK_UN); fclose($lock); }

    if (!$inserted) {
        throw new Exception('Could not save account after retries. Please try again. (' . ($lastError ? $lastError->getMessage() : '') . ')');
    }

    out([
        'success' => true,
        'ok'      => true,
        'message' => 'Account created successfully!',
        'user'    => [
            'id'     => $newId,
            'username' => $username,
            'email'    => $email,
            'role'     => 'Resident',
            'avatar'   => $savedAvatar,
        ]
    ], 201);

} catch (Throwable $e) {
    error_log('Register failed: ' . $e->getMessage());
    out(['error' => 'Could not create account: ' . $e->getMessage()], 500);
}