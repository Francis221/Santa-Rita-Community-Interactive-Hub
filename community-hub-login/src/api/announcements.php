<?php
require_once __DIR__ . '/config.php';

ini_set('display_errors', '0');
error_reporting(E_ALL);

$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0775, true);
}

try {
    // Ensure announcements table exists
    if ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
        $db->exec("CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            announcement_code TEXT NOT NULL,
            title TEXT NOT NULL,
            category TEXT DEFAULT 'Official Notice',
            date_info TEXT DEFAULT NULL,
            time_info TEXT DEFAULT '9:00 AM',
            location TEXT DEFAULT 'Barangay Hall',
            author TEXT DEFAULT 'Barangay Admin',
            content TEXT NOT NULL,
            badge TEXT DEFAULT 'Notice',
            image TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );");
    } else {
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
    }
} catch (Throwable $e) {
    error_log('announcements table setup notice: ' . $e->getMessage());
}

/**
 * Validates with finfo, enforces 5MB limit, creates random filename, moves file to uploads/,
 * and deletes old file when replaced.
 */
function handle_announcement_image_upload(?array $file, ?string $oldImagePath = null): ?string
{
    global $uploadDir;
    if (!$file || empty($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    // 1. Limit size to 5MB (5 * 1024 * 1024)
    if ($file['size'] > 5 * 1024 * 1024) {
        out(['success' => false, 'message' => 'Image exceeds maximum allowed size of 5MB.'], 422);
    }

    // 2. Validate with finfo (jpg, png, webp, gif only)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);

    $allowedMimes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif'
    ];

    if (!isset($allowedMimes[$mime])) {
        out(['success' => false, 'message' => 'Invalid image format. Allowed formats: JPG, PNG, WEBP, GIF.'], 422);
    }

    $ext = $allowedMimes[$mime];
    $randomFilename = 'ann_' . bin2hex(random_bytes(12)) . '.' . $ext;
    $destination = $uploadDir . $randomFilename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        out(['success' => false, 'message' => 'Failed to save uploaded image to uploads folder.'], 500);
    }

    // Delete old uploaded file when replaced (do not delete default bundled assets)
    if ($oldImagePath && str_contains($oldImagePath, 'uploads/')) {
        delete_uploaded_file($oldImagePath);
    }

    return 'uploads/' . $randomFilename;
}

function delete_uploaded_file(?string $imagePath): void
{
    global $uploadDir;
    if (!$imagePath || !str_contains($imagePath, 'uploads/')) return;

    $filename = basename($imagePath);
    $fullPath = $uploadDir . $filename;
    if (file_exists($fullPath) && is_file($fullPath)) {
        @unlink($fullPath);
    }
}

$rawInput = file_get_contents('php://input');
$jsonInput = json_decode($rawInput, true) ?: [];

$action = $_GET['action'] ?? $_POST['action'] ?? $jsonInput['action'] ?? $_REQUEST['action'] ?? 'list';

// -------------------------------------------------------------
// CREATE ANNOUNCEMENT (Supports multipart/form-data with file upload)
// -------------------------------------------------------------
if ($action === 'create') {
    require_admin();

    $title = trim($_POST['title'] ?? $jsonInput['title'] ?? 'Barangay Announcement');
    $category = trim($_POST['category'] ?? $jsonInput['category'] ?? 'Official Notice');
    $time = trim($_POST['time'] ?? $jsonInput['time'] ?? '9:00 AM');
    $location = trim($_POST['location'] ?? $jsonInput['location'] ?? 'Barangay Sta. Rita Central');
    $author = trim($_POST['author'] ?? $jsonInput['author'] ?? ($_SESSION['username'] ?? 'Barangay Council'));
    $content = trim($_POST['content'] ?? $jsonInput['content'] ?? '');
    $badge = trim($_POST['badge'] ?? $jsonInput['badge'] ?? 'Notice');

    if ($title === '' || $content === '') {
        out(['success' => false, 'message' => 'Title and Announcement content are required.'], 422);
    }

    $uploadedPath = null;
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadedPath = handle_announcement_image_upload($_FILES['image']);
    }

    $date = date('M d, Y');
    $code = 'ANN-' . rand(1000, 9999);

    $stmt = $db->prepare('INSERT INTO announcements (announcement_code, title, category, date_info, time_info, location, author, content, badge, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$code, $title, $category, $date, $time, $location, $author, $content, $badge, $uploadedPath]);
    $newId = $db->lastInsertId();

    // Automatically create a notification for all users
    create_notification(
        "📢 New Announcement: {$title}",
        substr($content, 0, 120) . (strlen($content) > 120 ? '...' : ''),
        '/announcements'
    );

    out([
        'success' => true,
        'message' => 'Announcement successfully posted!',
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
            'image' => $uploadedPath
        ]
    ]);
}

// -------------------------------------------------------------
// UPDATE / EDIT ANNOUNCEMENT
// -------------------------------------------------------------
elseif ($action === 'update' || $action === 'edit') {
    require_admin();

    $id = trim((string)($_POST['id'] ?? $jsonInput['id'] ?? ''));
    if ($id === '') {
        out(['success' => false, 'message' => 'Announcement ID is required for editing.'], 400);
    }

    // Fetch existing announcement
    $stmt = $db->prepare('SELECT * FROM announcements WHERE id = ? OR announcement_code = ? LIMIT 1');
    $stmt->execute([$id, $id]);
    $existing = $stmt->fetch();

    if (!$existing) {
        out(['success' => false, 'message' => 'Announcement not found.'], 404);
    }

    $title = trim($_POST['title'] ?? $jsonInput['title'] ?? $existing['title']);
    $category = trim($_POST['category'] ?? $jsonInput['category'] ?? $existing['category']);
    $time = trim($_POST['time'] ?? $jsonInput['time'] ?? $existing['time_info']);
    $location = trim($_POST['location'] ?? $jsonInput['location'] ?? $existing['location']);
    $content = trim($_POST['content'] ?? $jsonInput['content'] ?? $existing['content']);
    $badge = trim($_POST['badge'] ?? $jsonInput['badge'] ?? $existing['badge']);

    $imagePath = $existing['image'];
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadedPath = handle_announcement_image_upload($_FILES['image'], $existing['image']);
        if ($uploadedPath) {
            $imagePath = $uploadedPath;
        }
    }

    $updateStmt = $db->prepare('UPDATE announcements SET title = ?, category = ?, time_info = ?, location = ?, content = ?, badge = ?, image = ? WHERE id = ? OR announcement_code = ?');
    $updateStmt->execute([$title, $category, $time, $location, $content, $badge, $imagePath, $id, $id]);

    create_notification(
        "Announcement Updated: {$title}",
        "The announcement details have been updated.",
        '/announcements'
    );

    out([
        'success' => true,
        'message' => 'Announcement successfully updated!',
        'announcement' => [
            'id' => $existing['announcement_code'],
            'db_id' => (int)$existing['id'],
            'title' => $title,
            'category' => $category,
            'date' => $existing['date_info'],
            'time' => $time,
            'location' => $location,
            'author' => $existing['author'],
            'content' => $content,
            'badge' => $badge,
            'image' => $imagePath
        ]
    ]);
}

// -------------------------------------------------------------
// DELETE ANNOUNCEMENT (Cleans up uploaded image from disk)
// -------------------------------------------------------------
elseif ($action === 'delete') {
    require_admin();

    $id = $jsonInput['id'] ?? $_POST['id'] ?? $_REQUEST['id'] ?? null;
    if ($id) {
        // Fetch to clean up uploaded file
        $stmt = $db->prepare('SELECT image FROM announcements WHERE id = ? OR announcement_code = ? LIMIT 1');
        $stmt->execute([$id, $id]);
        $row = $stmt->fetch();
        if ($row && !empty($row['image'])) {
            delete_uploaded_file($row['image']);
        }

        $del = $db->prepare('DELETE FROM announcements WHERE id = ? OR announcement_code = ?');
        $del->execute([$id, $id]);
    }

    out(['success' => true]);
}

// -------------------------------------------------------------
// LIST ANNOUNCEMENTS
// -------------------------------------------------------------
else {
    $stmt = $db->query('SELECT * FROM announcements ORDER BY id DESC');
    $items = $stmt->fetchAll();

    out([
        'success' => true,
        'count' => count($items),
        'announcements' => array_map(function($a) {
            $img = $a['image'];
            // Normalize path for web consumption if uploaded
            if ($img && str_starts_with($img, 'uploads/')) {
                $img = '/api/' . $img;
            }
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
                'image' => $img
            ];
        }, $items)
    ]);
}
