<?php
require_once __DIR__ . '/config.php';

ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    // Ensure notifications table exists
    if ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
        $db->exec("CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            link TEXT DEFAULT NULL,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );");
    } else {
        $db->exec("CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT DEFAULT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            link VARCHAR(255) DEFAULT NULL,
            is_read TINYINT(1) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX (user_id),
            INDEX (is_read),
            INDEX (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }

    // Seed initial notifications if table is completely empty
    $notifCount = (int)$db->query("SELECT COUNT(*) FROM notifications")->fetchColumn();
    if ($notifCount === 0) {
        $db->exec("INSERT INTO notifications (user_id, title, message, link, is_read, created_at) VALUES 
            (NULL, 'Welcome to Community Hub!', 'Explore official announcements, events, and public services for Barangay Sta. Rita Central.', '/announcements', 0, NOW()),
            (NULL, 'Document Request Desk Active', 'You can now submit Barangay Clearance and Residency requests online.', '/request-document', 0, NOW());");
    }
} catch (Throwable $e) {
    error_log('Notifications table init error: ' . $e->getMessage());
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: [];

$action = $_GET['action'] ?? $_POST['action'] ?? $input['action'] ?? $_REQUEST['action'] ?? 'list';
$currentUserId = $_SESSION['user_id'] ?? null;

// 1. Mark One Notification as Read
if ($action === 'mark_read') {
    $id = (int)($input['id'] ?? $_POST['id'] ?? $_REQUEST['id'] ?? 0);
    if ($id > 0) {
        $stmt = $db->prepare('UPDATE notifications SET is_read = 1 WHERE id = ?');
        $stmt->execute([$id]);
    }
    out(['success' => true]);
}

// 2. Mark All Notifications as Read
if ($action === 'mark_all_read') {
    if ($currentUserId) {
        $stmt = $db->prepare('UPDATE notifications SET is_read = 1 WHERE (user_id IS NULL OR user_id = ?) AND is_read = 0');
        $stmt->execute([$currentUserId]);
    } else {
        $db->exec('UPDATE notifications SET is_read = 1 WHERE is_read = 0');
    }
    out(['success' => true]);
}

// 3. Create Notification (internal or authenticated helper)
if ($action === 'create') {
    $title = trim($input['title'] ?? $_POST['title'] ?? '');
    $message = trim($input['message'] ?? $_POST['message'] ?? '');
    $link = trim($input['link'] ?? $_POST['link'] ?? '/');
    $targetUserId = isset($input['user_id']) ? (int)$input['user_id'] : null;

    if ($title === '' || $message === '') {
        out(['success' => false, 'message' => 'Title and message are required.'], 400);
    }

    $created = create_notification($title, $message, $link, $targetUserId);
    out(['success' => $created]);
}

// 4. Default: List notifications & unread count
$query = "SELECT id, user_id, title, message, link, is_read, created_at 
          FROM notifications 
          WHERE (user_id IS NULL" . ($currentUserId ? " OR user_id = :uid" : "") . ") 
          ORDER BY id DESC LIMIT 40";

$stmt = $db->prepare($query);
if ($currentUserId) {
    $stmt->bindValue(':uid', (int)$currentUserId, PDO::PARAM_INT);
}
$stmt->execute();
$items = $stmt->fetchAll();

$unreadCount = 0;
$list = array_map(function($n) use (&$unreadCount) {
    $isRead = (bool)$n['is_read'];
    if (!$isRead) $unreadCount++;
    return [
        'id' => (int)$n['id'],
        'title' => $n['title'],
        'message' => $n['message'],
        'link' => $n['link'] ?: '/',
        'is_read' => $isRead,
        'created_at' => $n['created_at'],
        'time_formatted' => date('M d, Y h:i A', strtotime($n['created_at']))
    ];
}, $items);

out([
    'success' => true,
    'unread_count' => $unreadCount,
    'count' => count($list),
    'notifications' => $list
]);
