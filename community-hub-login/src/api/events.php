<?php
require_once __DIR__ . '/config.php';

ini_set('display_errors', '0');
error_reporting(E_ALL);

// Ensure upload directory exists
$uploadDir = (is_dir('/var/www/html') && is_writable('/var/www/html')) 
    ? '/var/www/html/uploads' 
    : __DIR__ . '/uploads';

if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

$action = $_GET['action'] ?? $_POST['action'] ?? $_REQUEST['action'] ?? 'list';

function format_event(array $e): array {
    return [
        'id' => $e['event_code'],
        'event_code' => $e['event_code'],
        'db_id' => (int)$e['id'],
        'title' => $e['title'],
        'category' => $e['category'] ?: 'Community',
        'description' => $e['description'] ?: '',
        'date' => $e['event_date'],
        'event_date' => $e['event_date'],
        'time' => trim(($e['start_time'] ?? '') . ($e['end_time'] ? ' - ' . $e['end_time'] : '')),
        'start_time' => $e['start_time'] ?: '9:00 AM',
        'end_time' => $e['end_time'] ?: '12:00 PM',
        'location' => $e['location'] ?: 'Barangay Plaza',
        'organizer' => $e['organizer'] ?: 'Barangay Council',
        'attendeesCount' => (int)($e['attendees_count'] ?? 0),
        'attendees_count' => (int)($e['attendees_count'] ?? 0),
        'image' => $e['image'] ?: '',
        'created_at' => $e['created_at']
    ];
}

/**
 * Validates that end_time is not chronologically before start_time.
 */
function validate_event_times(?string $start, ?string $end): bool {
    if (empty($start) || empty($end)) return true;
    $sTs = strtotime("2026-01-01 $start");
    $eTs = strtotime("2026-01-01 $end");
    if ($sTs !== false && $eTs !== false) {
        return $eTs >= $sTs;
    }
    return true;
}

// -------------------------------------------------------------
// 1. LIST EVENTS
// -------------------------------------------------------------
if ($action === 'list') {
    $stmt = $db->query('SELECT * FROM events ORDER BY id DESC');
    $events = $stmt->fetchAll();

    out([
        'success' => true,
        'count' => count($events),
        'events' => array_map('format_event', $events)
    ]);
}

// -------------------------------------------------------------
// 2. CREATE EVENT (Admin only)
// -------------------------------------------------------------
elseif ($action === 'create') {
    require_admin();

    $title = trim($_POST['title'] ?? '');
    $category = trim($_POST['category'] ?? 'Community');
    $description = trim($_POST['description'] ?? '');
    $eventDate = trim($_POST['date'] ?? $_POST['event_date'] ?? '');
    $startTime = trim($_POST['start_time'] ?? '9:00 AM');
    $endTime = trim($_POST['end_time'] ?? '12:00 PM');
    $location = trim($_POST['location'] ?? 'Barangay Plaza');
    $organizer = trim($_POST['organizer'] ?? 'Barangay Council');

    if ($title === '' || $eventDate === '') {
        out(['success' => false, 'error' => 'Event title and date are required.'], 400);
    }

    if (!validate_event_times($startTime, $endTime)) {
        out(['success' => false, 'error' => 'Event end time cannot be earlier than start time.'], 400);
    }

    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['image'];
        if ($file['size'] > 5 * 1024 * 1024) {
            out(['success' => false, 'error' => 'Image file exceeds the 5MB limit.'], 400);
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($mime, $allowedMimes)) {
            out(['success' => false, 'error' => 'Invalid file format. Only JPEG, PNG, WEBP, and GIF images are allowed.'], 400);
        }

        $extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
        $ext = $extMap[$mime] ?? 'jpg';
        $filename = 'event_' . bin2hex(random_bytes(10)) . '.' . $ext;
        $dest = $uploadDir . '/' . $filename;

        if (move_uploaded_file($file['tmp_name'], $dest)) {
            $imagePath = '/uploads/' . $filename;
        } else {
            out(['success' => false, 'error' => 'Failed to save uploaded image.'], 500);
        }
    }

    $code = 'EVT-' . rand(100, 999);
    $stmt = $db->prepare('INSERT INTO events (event_code, title, category, description, event_date, start_time, end_time, location, organizer, attendees_count, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, NOW())');
    $stmt->execute([$code, $title, $category, $description, $eventDate, $startTime, $endTime, $location, $organizer, $imagePath]);

    $newId = $db->lastInsertId();

    // Section 12: Notify residents through the bell when an event is created
    create_notification(
        "New Community Event: {$title}",
        "Date: {$eventDate} ({$startTime} - {$endTime}) at {$location}. Organized by {$organizer}.",
        "/events",
        null
    );

    out([
        'success' => true,
        'event' => format_event([
            'id' => $newId,
            'event_code' => $code,
            'title' => $title,
            'category' => $category,
            'description' => $description,
            'event_date' => $eventDate,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'location' => $location,
            'organizer' => $organizer,
            'attendees_count' => 1,
            'image' => $imagePath,
            'created_at' => date('Y-m-d H:i:s')
        ])
    ]);
}

// -------------------------------------------------------------
// 3. UPDATE EVENT (Admin only)
// -------------------------------------------------------------
elseif ($action === 'update') {
    require_admin();

    $codeOrId = trim($_POST['id'] ?? $_POST['event_code'] ?? '');
    if ($codeOrId === '') {
        out(['success' => false, 'error' => 'Event ID is required.'], 400);
    }

    $cStmt = $db->prepare('SELECT * FROM events WHERE id = ? OR event_code = ? LIMIT 1');
    $cStmt->execute([$codeOrId, $codeOrId]);
    $existing = $cStmt->fetch();
    if (!$existing) {
        out(['success' => false, 'error' => 'Event not found.'], 404);
    }

    $title = trim($_POST['title'] ?? $existing['title']);
    $category = trim($_POST['category'] ?? $existing['category']);
    $description = trim($_POST['description'] ?? $existing['description']);
    $eventDate = trim($_POST['date'] ?? $_POST['event_date'] ?? $existing['event_date']);
    $startTime = trim($_POST['start_time'] ?? $existing['start_time']);
    $endTime = trim($_POST['end_time'] ?? $existing['end_time']);
    $location = trim($_POST['location'] ?? $existing['location']);
    $organizer = trim($_POST['organizer'] ?? $existing['organizer']);

    if ($title === '' || $eventDate === '') {
        out(['success' => false, 'error' => 'Event title and date cannot be empty.'], 400);
    }

    if (!validate_event_times($startTime, $endTime)) {
        out(['success' => false, 'error' => 'Event end time cannot be earlier than start time.'], 400);
    }

    $imagePath = $existing['image'];
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['image'];
        if ($file['size'] > 5 * 1024 * 1024) {
            out(['success' => false, 'error' => 'Image file exceeds the 5MB limit.'], 400);
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($mime, $allowedMimes)) {
            out(['success' => false, 'error' => 'Invalid file format. Only JPEG, PNG, WEBP, and GIF images are allowed.'], 400);
        }

        $extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
        $ext = $extMap[$mime] ?? 'jpg';
        $filename = 'event_' . bin2hex(random_bytes(10)) . '.' . $ext;
        $dest = $uploadDir . '/' . $filename;

        if (move_uploaded_file($file['tmp_name'], $dest)) {
            $imagePath = '/uploads/' . $filename;
        } else {
            out(['success' => false, 'error' => 'Failed to save uploaded image.'], 500);
        }
    }

    $dateChanged = ($eventDate !== $existing['event_date']);
    $timeChanged = ($startTime !== $existing['start_time'] || $endTime !== $existing['end_time']);

    $uStmt = $db->prepare('UPDATE events SET title = ?, category = ?, description = ?, event_date = ?, start_time = ?, end_time = ?, location = ?, organizer = ?, image = ? WHERE id = ?');
    $uStmt->execute([$title, $category, $description, $eventDate, $startTime, $endTime, $location, $organizer, $imagePath, $existing['id']]);

    // Section 12: Notify residents through the bell when significantly updated (e.g. date/time changed)
    if ($dateChanged || $timeChanged) {
        create_notification(
            "Event Schedule Update: {$title}",
            "The schedule for {$title} has changed to {$eventDate} ({$startTime} - {$endTime}) at {$location}.",
            "/events",
            null
        );
    }

    out([
        'success' => true,
        'event' => format_event([
            'id' => $existing['id'],
            'event_code' => $existing['event_code'],
            'title' => $title,
            'category' => $category,
            'description' => $description,
            'event_date' => $eventDate,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'location' => $location,
            'organizer' => $organizer,
            'attendees_count' => (int)$existing['attendees_count'],
            'image' => $imagePath,
            'created_at' => $existing['created_at']
        ])
    ]);
}

// -------------------------------------------------------------
// 4. DELETE EVENT (Admin only)
// -------------------------------------------------------------
elseif ($action === 'delete') {
    require_admin();
    $input = json_post();
    $id = $input['id'] ?? $_GET['id'] ?? null;

    if ($id) {
        $stmt = $db->prepare('DELETE FROM events WHERE id = ? OR event_code = ?');
        $stmt->execute([$id, $id]);
    }

    out(['success' => true]);
}

else {
    out(['success' => false, 'error' => 'Invalid action.'], 400);
}
