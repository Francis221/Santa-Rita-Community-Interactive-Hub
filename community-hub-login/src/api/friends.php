<?php
require 'config.php';

ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    if ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
        $db->exec("CREATE TABLE IF NOT EXISTS friends (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            friend_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, friend_id)
        );");
    } else {
        $db->exec("CREATE TABLE IF NOT EXISTS friends (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            friend_id INT NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY (user_id, friend_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }
} catch (Throwable $e) {
    error_log('Friends table setup error: ' . $e->getMessage());
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: [];

$action = $_GET['action'] ?? $_POST['action'] ?? $input['action'] ?? $_REQUEST['action'] ?? 'list';
$currentUserId = $_SESSION['user_id'] ?? $input['user_id'] ?? $_REQUEST['user_id'] ?? null;
$username = $input['username'] ?? $_REQUEST['username'] ?? null;

if (!$currentUserId && $username) {
    $uStmt = $db->prepare('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1');
    $uStmt->execute([$username, $username]);
    $uRow = $uStmt->fetch();
    if ($uRow) $currentUserId = (int)$uRow['id'];
}

if ($action === 'send') {
    $friendId = (int)($input['friend_id'] ?? $_REQUEST['friend_id'] ?? 0);
    $friendName = $input['friend_username'] ?? $_REQUEST['friend_username'] ?? null;

    if (!$friendId && $friendName) {
        $stmt = $db->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$friendName]);
        $r = $stmt->fetch();
        if ($r) $friendId = (int)$r['id'];
    }

    if (!$currentUserId || !$friendId || $currentUserId === $friendId) {
        out(['success' => false, 'message' => 'Invalid user or friend ID.'], 400);
    }

    try {
        $stmt = $db->prepare('INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, "pending")');
        $stmt->execute([$currentUserId, $friendId]);
    } catch (Throwable $e) {}

    out(['success' => true, 'message' => 'Friend request sent.']);
} elseif ($action === 'accept') {
    $friendId = (int)($input['friend_id'] ?? $_REQUEST['friend_id'] ?? 0);

    if (!$currentUserId || !$friendId) {
        out(['success' => false, 'message' => 'Invalid friend ID.'], 400);
    }

    try {
        // Update request from friend to current user
        $stmt = $db->prepare('UPDATE friends SET status = "accepted" WHERE user_id = ? AND friend_id = ?');
        $stmt->execute([$friendId, $currentUserId]);

        // Ensure reverse record exists
        $rev = $db->prepare('INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, "accepted")');
        try { $rev->execute([$currentUserId, $friendId]); } catch (Throwable $e) {
            $db->prepare('UPDATE friends SET status = "accepted" WHERE user_id = ? AND friend_id = ?')->execute([$currentUserId, $friendId]);
        }
    } catch (Throwable $e) {}

    out(['success' => true, 'message' => 'Friend request accepted.']);
} elseif ($action === 'reject' || $action === 'remove') {
    $friendId = (int)($input['friend_id'] ?? $_REQUEST['friend_id'] ?? 0);

    if ($currentUserId && $friendId) {
        $del = $db->prepare('DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)');
        $del->execute([$currentUserId, $friendId, $friendId, $currentUserId]);
    }

    out(['success' => true, 'message' => 'Friend request removed.']);
} else {
    // Action 'list'
    if (!$currentUserId) {
        out(['success' => true, 'friends' => [], 'incoming' => [], 'outgoing' => []]);
    }

    $stmt = $db->prepare('SELECT * FROM friends WHERE user_id = ? OR friend_id = ?');
    $stmt->execute([$currentUserId, $currentUserId]);
    $rows = $stmt->fetchAll();

    $friends = [];
    $incoming = [];
    $outgoing = [];

    foreach ($rows as $r) {
        $uId = (int)$r['user_id'];
        $fId = (int)$r['friend_id'];
        $status = $r['status'];

        if ($status === 'accepted') {
            $otherId = ($uId === $currentUserId) ? $fId : $uId;
            $friends[] = $otherId;
        } elseif ($status === 'pending') {
            if ($uId === $currentUserId) {
                $outgoing[] = $fId;
            } elseif ($fId === $currentUserId) {
                $incoming[] = $uId;
            }
        }
    }

    out([
        'success' => true,
        'friends' => array_values(array_unique($friends)),
        'incoming' => array_values(array_unique($incoming)),
        'outgoing' => array_values(array_unique($outgoing))
    ]);
}
