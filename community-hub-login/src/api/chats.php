<?php
require 'config.php';

ini_set('display_errors', '0');
error_reporting(E_ALL);

// Apply WAL mode for SQLite
try {
    if ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
        $db->exec('PRAGMA journal_mode=WAL');
        $db->exec('PRAGMA busy_timeout=10000');
    }
} catch (Throwable $e) {}

// Ensure messages table exists (compatible with both MySQL and SQLite)
try {
    if ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
        $db->exec("CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER DEFAULT NULL,
            conversation_id TEXT DEFAULT NULL,
            text TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );");
    } else {
        $db->exec("CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            receiver_id INT DEFAULT NULL,
            conversation_id VARCHAR(100) DEFAULT NULL,
            text TEXT NOT NULL,
            is_read TINYINT(1) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX (sender_id),
            INDEX (receiver_id),
            INDEX (conversation_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }
} catch (Throwable $e) {
    error_log('Messages table creation error: ' . $e->getMessage());
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: [];

$action = $_GET['action'] ?? $_POST['action'] ?? $input['action'] ?? $_REQUEST['action'] ?? 'fetch';

// Identify Current User from Session or Request Parameters
$currentUserId = $_SESSION['user_id'] ?? null;
$reqUserId = $input['sender_id'] ?? $input['user_id'] ?? $_REQUEST['sender_id'] ?? $_REQUEST['user_id'] ?? null;
$reqUsername = $input['sender_username'] ?? $input['sender_name'] ?? $_REQUEST['sender_username'] ?? $_REQUEST['sender_name'] ?? $_REQUEST['username'] ?? null;

if (!$currentUserId && $reqUserId) {
    $currentUserId = (int)$reqUserId;
}

if (!$currentUserId && $reqUsername) {
    $stmt = $db->prepare('SELECT id, username FROM users WHERE username = ? OR email = ? LIMIT 1');
    $stmt->execute([$reqUsername, $reqUsername]);
    $uRow = $stmt->fetch();
    if ($uRow) {
        $currentUserId = (int)$uRow['id'];
    }
}

// -------------------------------------------------------------
// 1. ACTION: SEND MESSAGE
// -------------------------------------------------------------
if ($action === 'send') {
    $text = trim($input['text'] ?? $_POST['text'] ?? $_REQUEST['text'] ?? '');
    $receiverId = $input['receiver_id'] ?? $_POST['receiver_id'] ?? $_REQUEST['receiver_id'] ?? null;
    $receiverName = $input['receiver_name'] ?? $_POST['receiver_name'] ?? $_REQUEST['receiver_name'] ?? null;
    $convId = $input['conversation_id'] ?? $_POST['conversation_id'] ?? $_REQUEST['conversation_id'] ?? null;

    if (empty($text)) {
        out(['success' => false, 'message' => 'Message text cannot be empty.'], 400);
    }

    if (!$currentUserId) {
        $currentUserId = 1; // Default fallback to system user if unauthenticated
    }

    // Handle Community Hub Group Chat
    if ($convId === 'community-hub' || strtolower($receiverName ?? '') === 'community hub') {
        $convId = 'community-hub';
        $receiverId = null;
    } else {
        // Resolve receiver ID if missing
        if (!$receiverId && $receiverName) {
            $rStmt = $db->prepare('SELECT id FROM users WHERE username = ? OR username LIKE ? LIMIT 1');
            $rStmt->execute([$receiverName, "%$receiverName%"]);
            $rUser = $rStmt->fetch();
            if ($rUser) {
                $receiverId = (int)$rUser['id'];
            }
        }

        // Generate normalized 1-on-1 conversation ID: conv_{min}_{max}
        if ($receiverId && $receiverId != $currentUserId) {
            $minId = min((int)$currentUserId, (int)$receiverId);
            $maxId = max((int)$currentUserId, (int)$receiverId);
            $convId = "conv_{$minId}_{$maxId}";
        } elseif (!$convId) {
            $convId = "conv_{$currentUserId}_general";
        }
    }

    $stmt = $db->prepare('INSERT INTO messages (sender_id, receiver_id, conversation_id, text, created_at) VALUES (?, ?, ?, ?, NOW())');
    $stmt->execute([$currentUserId, $receiverId ? (int)$receiverId : null, $convId, $text]);
    $newId = (int)$db->lastInsertId();

    // Fetch sender info
    $sStmt = $db->prepare('SELECT username, avatar, role FROM users WHERE id = ?');
    $sStmt->execute([$currentUserId]);
    $senderInfo = $sStmt->fetch() ?: ['username' => 'User', 'role' => 'Resident', 'avatar' => null];

    out([
        'success' => true,
        'message' => [
            'id' => $newId,
            'sender_id' => (int)$currentUserId,
            'receiver_id' => $receiverId ? (int)$receiverId : null,
            'conversation_id' => $convId,
            'text' => $text,
            'sender' => 'user',
            'sender_name' => $senderInfo['username'],
            'sender_role' => $senderInfo['role'],
            'sender_avatar' => $senderInfo['avatar'],
            'time' => date('h:i A'),
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
}

// -------------------------------------------------------------
// 2. ACTION: GET CONVERSATIONS DIRECTORY FOR CURRENT USER
// -------------------------------------------------------------
elseif ($action === 'conversations') {
    // If not identified yet, try to default to first active or admin
    $myId = $currentUserId ?: 0;

    // Fetch all other registered users in DB
    $usersStmt = $db->query('
        SELECT id, username, email, role, avatar, is_online, last_active 
        FROM users 
        ORDER BY is_online DESC, username ASC
    ');
    $allUsers = $usersStmt->fetchAll();

    // Generate color array for avatar styling
    $colors = ['#2563eb', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

    $conversationsList = [];

    // 1. Group Chat: Community Hub (Broadcast / General Community Channel)
    $groupMsgStmt = $db->query("
        SELECT m.text, m.created_at, u.username as sender_username 
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = 'community-hub'
        ORDER BY m.created_at DESC LIMIT 1
    ");
    $lastGroupMsg = $groupMsgStmt->fetch();

    $conversationsList[] = [
        'id' => 'community-hub',
        'other_user_id' => null,
        'name' => 'Community Hub',
        'role' => 'Official Broadcast & Community',
        'initials' => 'CH',
        'avatarColor' => '#3b82f6',
        'isGroup' => true,
        'isOnline' => true,
        'unreadCount' => 0,
        'lastMessage' => $lastGroupMsg ? ($lastGroupMsg['sender_username'] . ': ' . $lastGroupMsg['text']) : 'No messages yet',
        'lastTime' => $lastGroupMsg ? date('h:i A', strtotime($lastGroupMsg['created_at'])) : '',
    ];

    // 2. Direct 1-on-1 chats with all other registered users
    foreach ($allUsers as $idx => $u) {
        $uId = (int)$u['id'];
        if ($myId > 0 && $uId === $myId) {
            continue; // Don't show self as conversation partner
        }

        $minId = min($myId, $uId);
        $maxId = max($myId, $uId);
        $convKey = "conv_{$minId}_{$maxId}";

        // Get latest message between current user and this user
        $lastMsgStmt = $db->prepare('
            SELECT text, created_at, sender_id 
            FROM messages 
            WHERE (conversation_id = ?) 
               OR (sender_id = ? AND receiver_id = ?) 
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at DESC 
            LIMIT 1
        ');
        $lastMsgStmt->execute([$convKey, $myId, $uId, $uId, $myId]);
        $lastMsg = $lastMsgStmt->fetch();

        // Check if user is actively online (within 3 minutes)
        $isUserOnline = (bool)$u['is_online'];
        if (!empty($u['last_active'])) {
            $diff = time() - strtotime($u['last_active']);
            if ($diff > 180) {
                $isUserOnline = false;
            }
        }

        $initials = strtoupper(substr($u['username'], 0, 2));

        $conversationsList[] = [
            'id' => $convKey,
            'other_user_id' => $uId,
            'username' => $u['username'],
            'name' => ucfirst($u['username']),
            'role' => $u['role'] ?? 'Resident',
            'initials' => $initials,
            'avatar' => $u['avatar'],
            'avatarColor' => $colors[$idx % count($colors)],
            'isGroup' => false,
            'isOnline' => $isUserOnline,
            'unreadCount' => 0,
            'lastMessage' => $lastMsg ? $lastMsg['text'] : 'No messages yet',
            'lastTime' => $lastMsg ? date('h:i A', strtotime($lastMsg['created_at'])) : '',
        ];
    }

    out([
        'success' => true,
        'current_user_id' => $myId,
        'conversations' => $conversationsList
    ]);
}

// -------------------------------------------------------------
// 3. ACTION: FETCH MESSAGES
// -------------------------------------------------------------
elseif ($action === 'fetch') {
    $convId = $_GET['conversation_id'] ?? $_REQUEST['conversation_id'] ?? $input['conversation_id'] ?? null;
    $withUserId = $_GET['with_id'] ?? $_REQUEST['with_id'] ?? $input['with_id'] ?? null;
    $withName = $_GET['with_name'] ?? $_REQUEST['with_name'] ?? $input['with_name'] ?? null;

    if (!$withUserId && $withName) {
        $rStmt = $db->prepare('SELECT id FROM users WHERE username = ? OR username LIKE ? LIMIT 1');
        $rStmt->execute([$withName, "%$withName%"]);
        $rUser = $rStmt->fetch();
        if ($rUser) $withUserId = (int)$rUser['id'];
    }

    // Determine query
    if ($convId === 'community-hub') {
        $stmt = $db->prepare('
            SELECT m.*, u.username as sender_username, u.role as sender_role, u.avatar as sender_avatar
            FROM messages m
            LEFT JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = "community-hub"
            ORDER BY m.created_at ASC
        ');
        $stmt->execute();
    } elseif ($convId && strpos($convId, 'conv_') === 0) {
        $stmt = $db->prepare('
            SELECT m.*, u.username as sender_username, u.role as sender_role, u.avatar as sender_avatar
            FROM messages m
            LEFT JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ?
            ORDER BY m.created_at ASC
        ');
        $stmt->execute([$convId]);
    } elseif ($withUserId && $currentUserId) {
        $minId = min((int)$currentUserId, (int)$withUserId);
        $maxId = max((int)$currentUserId, (int)$withUserId);
        $pairConvId = "conv_{$minId}_{$maxId}";

        $stmt = $db->prepare('
            SELECT m.*, u.username as sender_username, u.role as sender_role, u.avatar as sender_avatar
            FROM messages m
            LEFT JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ?
               OR (m.sender_id = ? AND m.receiver_id = ?) 
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        ');
        $stmt->execute([$pairConvId, $currentUserId, $withUserId, $withUserId, $currentUserId]);
    } else {
        // Fetch recent messages
        $stmt = $db->prepare('
            SELECT m.*, u.username as sender_username, u.role as sender_role, u.avatar as sender_avatar
            FROM messages m
            LEFT JOIN users u ON m.sender_id = u.id
            ORDER BY m.created_at ASC
            LIMIT 200
        ');
        $stmt->execute();
    }

    $messages = $stmt->fetchAll();

    out([
        'success' => true,
        'count' => count($messages),
        'current_user_id' => $currentUserId ? (int)$currentUserId : null,
        'messages' => array_map(function($m) use ($currentUserId) {
            $isMine = ($currentUserId && (int)$m['sender_id'] === (int)$currentUserId);
            return [
                'id' => (int)$m['id'],
                'sender_id' => (int)$m['sender_id'],
                'receiver_id' => $m['receiver_id'] ? (int)$m['receiver_id'] : null,
                'conversation_id' => $m['conversation_id'],
                'sender' => $isMine ? 'user' : 'other',
                'sender_name' => $m['sender_username'] ?? 'User',
                'sender_role' => $m['sender_role'] ?? 'Resident',
                'sender_avatar' => $m['sender_avatar'] ?? null,
                'text' => $m['text'],
                'time' => date('h:i A', strtotime($m['created_at'])),
                'created_at' => $m['created_at']
            ];
        }, $messages)
    ]);
}

// -------------------------------------------------------------
// 4. ACTION: CLEAR ALL MESSAGES
// -------------------------------------------------------------
elseif ($action === 'clear' || $action === 'clear_all' || $action === 'delete_all') {
    try {
        $convId = $_GET['conversation_id'] ?? $input['conversation_id'] ?? null;
        if ($convId) {
            $stmt = $db->prepare('DELETE FROM messages WHERE conversation_id = ?');
            $stmt->execute([$convId]);
            out(['success' => true, 'message' => "Messages for $convId have been removed."]);
        } else {
            $db->exec("TRUNCATE TABLE messages");
            out(['success' => true, 'message' => 'All chat messages have been removed successfully.']);
        }
    } catch (Throwable $e) {
        out(['success' => false, 'message' => 'Failed to remove messages: ' . $e->getMessage()], 500);
    }
} else {
    out(['success' => false, 'message' => 'Invalid action.'], 400);
}
