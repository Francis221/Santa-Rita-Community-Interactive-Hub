<?php
require 'config.php';

// Prevent notices in JSON response
ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    // Ensure announcements table exists in MySQL database
    $db->exec("CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        announcement_code VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'Official Notice',
        date_info VARCHAR(100) DEFAULT NULL,
        time_info VARCHAR(100) DEFAULT '9:00 AM',
        location VARCHAR(255) DEFAULT 'Barangay Hall',
        author VARCHAR(150) DEFAULT 'Barangay Admin',
        content TEXT NOT NULL,
        badge VARCHAR(50) DEFAULT 'Notice',
        image LONGTEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} catch (Throwable $e) {
    error_log('announcements table setup notice: ' . $e->getMessage());
}

$action = $_GET['action'] ?? $_POST['action'] ?? $_REQUEST['action'] ?? 'list';

if ($action === 'create') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: [];

    $title = trim($input['title'] ?? $_POST['title'] ?? $_REQUEST['title'] ?? 'Barangay Announcement');
    $category = trim($input['category'] ?? $_POST['category'] ?? $_REQUEST['category'] ?? 'General');
    $time = trim($input['time'] ?? $_POST['time'] ?? $_REQUEST['time'] ?? '9:00 AM');
    $location = trim($input['location'] ?? $_POST['location'] ?? $_REQUEST['location'] ?? 'Barangay Hall');
    $author = trim($input['author'] ?? $_POST['author'] ?? $_REQUEST['author'] ?? 'Barangay Admin');
    $content = trim($input['content'] ?? $_POST['content'] ?? $_REQUEST['content'] ?? '');
    $badge = trim($input['badge'] ?? $_POST['badge'] ?? $_REQUEST['badge'] ?? 'Notice');
    $image = $input['image'] ?? $_POST['image'] ?? $_REQUEST['image'] ?? null;
    $date = date('M d, Y');

    $code = 'ANN-' . rand(1000, 9999);

    $stmt = $db->prepare('INSERT INTO announcements (announcement_code, title, category, date_info, time_info, location, author, content, badge, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$code, $title, $category, $date, $time, $location, $author, $content, $badge, $image]);

    $newId = $db->lastInsertId();

    out([
        'success' => true,
        'announcement' => [
            'id' => $code,
            'db_id' => (int)$newId,
            'title' => $title,
            'category' => $category,
            'date' => $date,
            'time' => $time,
            'location' => $location,
            'author' => $author,
            'content' => $content,
            'badge' => $badge,
            'image' => $image || 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&auto=format&fit=crop&q=80'
        ]
    ]);
} elseif ($action === 'delete') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: [];
    $id = $input['id'] ?? $_POST['id'] ?? $_REQUEST['id'] ?? null;

    if ($id) {
        $stmt = $db->prepare('DELETE FROM announcements WHERE id = ? OR announcement_code = ?');
        $stmt->execute([$id, $id]);
    }

    out(['success' => true]);
} else {
    // Action 'list'
    $stmt = $db->query('SELECT * FROM announcements ORDER BY id DESC');
    $items = $stmt->fetchAll();

    out([
        'success' => true,
        'count' => count($items),
        'announcements' => array_map(function($a) {
            return [
                'id' => $a['announcement_code'],
                'db_id' => (int)$a['id'],
                'title' => $a['title'],
                'category' => $a['category'],
                'date' => $a['date_info'] ?: date('M d, Y', strtotime($a['created_at'])),
                'time' => $a['time_info'],
                'location' => $a['location'],
                'author' => $a['author'],
                'content' => $a['content'],
                'badge' => $a['badge'],
                'image' => $a['image'] ?: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&auto=format&fit=crop&q=80'
            ];
        }, $items)
    ]);
}
