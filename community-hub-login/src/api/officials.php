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

function format_official(array $o): array {
    return [
        'id' => (int)$o['id'],
        'name' => $o['name'],
        'position' => $o['position'],
        'rank_order' => (int)$o['rank_order'],
        'committee' => $o['committee'] ?: '',
        'photo' => $o['photo'] ?: '',
        'term_start' => $o['term_start'] ?: '2023',
        'term_end' => $o['term_end'] ?: '2026',
        'is_active' => (bool)$o['is_active'],
        'phone' => $o['phone'] ?: '',
        'email' => $o['email'] ?: ''
    ];
}

// -------------------------------------------------------------
// 1. LIST OFFICIALS (Always ordered by rank_order ASC, name ASC)
// -------------------------------------------------------------
if ($action === 'list') {
    // If not admin, only show active officials
    $isAdmin = (($_SESSION['role'] ?? '') === 'Admin');
    $includeInactive = $isAdmin && isset($_GET['all']) && $_GET['all'] === '1';

    if ($includeInactive) {
        $stmt = $db->query('SELECT * FROM officials ORDER BY rank_order ASC, name ASC');
    } else {
        $stmt = $db->query('SELECT * FROM officials WHERE is_active = 1 ORDER BY rank_order ASC, name ASC');
    }
    $officials = $stmt->fetchAll();

    out([
        'success' => true,
        'count' => count($officials),
        'officials' => array_map('format_official', $officials)
    ]);
}

// -------------------------------------------------------------
// 2. CREATE OFFICIAL (Admin only)
// -------------------------------------------------------------
elseif ($action === 'create') {
    require_admin();

    $name = trim($_POST['name'] ?? '');
    $position = trim($_POST['position'] ?? 'Barangay Kagawad');
    $committee = trim($_POST['committee'] ?? '');
    $rankOrder = (int)($_POST['rank_order'] ?? 10);
    $termStart = trim($_POST['term_start'] ?? '2023');
    $termEnd = trim($_POST['term_end'] ?? '2026');
    $phone = trim($_POST['phone'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $isActive = isset($_POST['is_active']) ? (int)$_POST['is_active'] : 1;

    if ($name === '' || $position === '') {
        out(['success' => false, 'error' => 'Official name and position are required.'], 400);
    }

    // Validation: Only 1 active Punong Barangay allowed
    $isCaptain = (stripos($position, 'Punong Barangay') !== false || stripos($position, 'Captain') !== false);
    if ($isCaptain && $isActive === 1) {
        $cStmt = $db->query("SELECT COUNT(*) FROM officials WHERE (position LIKE '%Punong Barangay%' OR position LIKE '%Captain%') AND is_active = 1");
        if ((int)$cStmt->fetchColumn() >= 1) {
            out(['success' => false, 'error' => 'Validation error: Only one active Punong Barangay (Barangay Captain) is allowed.'], 400);
        }
    }

    // Validation: Only up to 7 active Kagawads allowed
    $isKagawad = (stripos($position, 'Kagawad') !== false || stripos($position, 'Sangguniang Barangay') !== false);
    if ($isKagawad && $isActive === 1) {
        $kStmt = $db->query("SELECT COUNT(*) FROM officials WHERE (position LIKE '%Kagawad%' OR position LIKE '%Sangguniang Barangay%') AND is_active = 1");
        if ((int)$kStmt->fetchColumn() >= 7) {
            out(['success' => false, 'error' => 'Validation error: Only up to 7 active Sangguniang Barangay Members (Kagawads) are allowed.'], 400);
        }
    }

    // File photo upload validation (Section 2 rules)
    $photoPath = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['photo'];
        if ($file['size'] > 5 * 1024 * 1024) {
            out(['success' => false, 'error' => 'Photo file exceeds the 5MB limit.'], 400);
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
        $filename = 'official_' . bin2hex(random_bytes(10)) . '.' . $ext;
        $dest = $uploadDir . '/' . $filename;

        if (move_uploaded_file($file['tmp_name'], $dest)) {
            $photoPath = '/uploads/' . $filename;
        } else {
            out(['success' => false, 'error' => 'Failed to save uploaded photo.'], 500);
        }
    }

    $stmt = $db->prepare('INSERT INTO officials (name, position, rank_order, committee, photo, term_start, term_end, is_active, phone, email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$name, $position, $rankOrder, $committee, $photoPath, $termStart, $termEnd, $isActive, $phone, $email]);

    $newId = $db->lastInsertId();

    out([
        'success' => true,
        'official' => format_official([
            'id' => $newId,
            'name' => $name,
            'position' => $position,
            'rank_order' => $rankOrder,
            'committee' => $committee,
            'photo' => $photoPath,
            'term_start' => $termStart,
            'term_end' => $termEnd,
            'is_active' => $isActive,
            'phone' => $phone,
            'email' => $email
        ])
    ]);
}

// -------------------------------------------------------------
// 3. UPDATE OFFICIAL (Admin only)
// -------------------------------------------------------------
elseif ($action === 'update') {
    require_admin();

    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) {
        out(['success' => false, 'error' => 'Official ID is required.'], 400);
    }

    $checkStmt = $db->prepare('SELECT * FROM officials WHERE id = ?');
    $checkStmt->execute([$id]);
    $existing = $checkStmt->fetch();
    if (!$existing) {
        out(['success' => false, 'error' => 'Official not found.'], 404);
    }

    $name = trim($_POST['name'] ?? $existing['name']);
    $position = trim($_POST['position'] ?? $existing['position']);
    $committee = isset($_POST['committee']) ? trim($_POST['committee']) : $existing['committee'];
    $rankOrder = isset($_POST['rank_order']) ? (int)$_POST['rank_order'] : (int)$existing['rank_order'];
    $termStart = trim($_POST['term_start'] ?? $existing['term_start']);
    $termEnd = trim($_POST['term_end'] ?? $existing['term_end']);
    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : $existing['phone'];
    $email = isset($_POST['email']) ? trim($_POST['email']) : $existing['email'];
    $isActive = isset($_POST['is_active']) ? (int)$_POST['is_active'] : (int)$existing['is_active'];

    // Validation: Only 1 active Punong Barangay allowed
    $isCaptain = (stripos($position, 'Punong Barangay') !== false || stripos($position, 'Captain') !== false);
    if ($isCaptain && $isActive === 1) {
        $cStmt = $db->prepare("SELECT COUNT(*) FROM officials WHERE (position LIKE '%Punong Barangay%' OR position LIKE '%Captain%') AND is_active = 1 AND id != ?");
        $cStmt->execute([$id]);
        if ((int)$cStmt->fetchColumn() >= 1) {
            out(['success' => false, 'error' => 'Validation error: Only one active Punong Barangay (Barangay Captain) is allowed.'], 400);
        }
    }

    // Validation: Only up to 7 active Kagawads allowed
    $isKagawad = (stripos($position, 'Kagawad') !== false || stripos($position, 'Sangguniang Barangay') !== false);
    if ($isKagawad && $isActive === 1) {
        $kStmt = $db->prepare("SELECT COUNT(*) FROM officials WHERE (position LIKE '%Kagawad%' OR position LIKE '%Sangguniang Barangay%') AND is_active = 1 AND id != ?");
        $kStmt->execute([$id]);
        if ((int)$kStmt->fetchColumn() >= 7) {
            out(['success' => false, 'error' => 'Validation error: Only up to 7 active Sangguniang Barangay Members (Kagawads) are allowed.'], 400);
        }
    }

    $photoPath = $existing['photo'];
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['photo'];
        if ($file['size'] > 5 * 1024 * 1024) {
            out(['success' => false, 'error' => 'Photo file exceeds the 5MB limit.'], 400);
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
        $filename = 'official_' . bin2hex(random_bytes(10)) . '.' . $ext;
        $dest = $uploadDir . '/' . $filename;

        if (move_uploaded_file($file['tmp_name'], $dest)) {
            $photoPath = '/uploads/' . $filename;
        } else {
            out(['success' => false, 'error' => 'Failed to save uploaded photo.'], 500);
        }
    }

    $stmt = $db->prepare('UPDATE officials SET name = ?, position = ?, rank_order = ?, committee = ?, photo = ?, term_start = ?, term_end = ?, is_active = ?, phone = ?, email = ? WHERE id = ?');
    $stmt->execute([$name, $position, $rankOrder, $committee, $photoPath, $termStart, $termEnd, $isActive, $phone, $email, $id]);

    out([
        'success' => true,
        'official' => format_official([
            'id' => $id,
            'name' => $name,
            'position' => $position,
            'rank_order' => $rankOrder,
            'committee' => $committee,
            'photo' => $photoPath,
            'term_start' => $termStart,
            'term_end' => $termEnd,
            'is_active' => $isActive,
            'phone' => $phone,
            'email' => $email
        ])
    ]);
}

// -------------------------------------------------------------
// 4. DEACTIVATE / TOGGLE ACTIVE (Admin only)
// -------------------------------------------------------------
elseif ($action === 'toggle_active' || $action === 'deactivate') {
    require_admin();
    $input = json_post();
    $id = (int)($input['id'] ?? $_POST['id'] ?? 0);
    if ($id <= 0) out(['success' => false, 'error' => 'Official ID required.'], 400);

    $stmt = $db->prepare('SELECT id, is_active, position FROM officials WHERE id = ?');
    $stmt->execute([$id]);
    $off = $stmt->fetch();
    if (!$off) out(['success' => false, 'error' => 'Official not found.'], 404);

    $newActive = ($action === 'deactivate') ? 0 : ($off['is_active'] ? 0 : 1);

    // If activating, validate constraints
    if ($newActive === 1) {
        $pos = $off['position'];
        if (stripos($pos, 'Punong Barangay') !== false || stripos($pos, 'Captain') !== false) {
            $cStmt = $db->prepare("SELECT COUNT(*) FROM officials WHERE (position LIKE '%Punong Barangay%' OR position LIKE '%Captain%') AND is_active = 1 AND id != ?");
            $cStmt->execute([$id]);
            if ((int)$cStmt->fetchColumn() >= 1) {
                out(['success' => false, 'error' => 'Cannot activate: Only one active Punong Barangay allowed.'], 400);
            }
        }
        if (stripos($pos, 'Kagawad') !== false || stripos($pos, 'Sangguniang Barangay') !== false) {
            $kStmt = $db->prepare("SELECT COUNT(*) FROM officials WHERE (position LIKE '%Kagawad%' OR position LIKE '%Sangguniang Barangay%') AND is_active = 1 AND id != ?");
            $kStmt->execute([$id]);
            if ((int)$kStmt->fetchColumn() >= 7) {
                out(['success' => false, 'error' => 'Cannot activate: Only up to 7 active Kagawads allowed.'], 400);
            }
        }
    }

    $db->prepare('UPDATE officials SET is_active = ? WHERE id = ?')->execute([$newActive, $id]);
    out(['success' => true, 'is_active' => (bool)$newActive]);
}

// -------------------------------------------------------------
// 5. REORDER OFFICIALS (Admin only)
// -------------------------------------------------------------
elseif ($action === 'reorder') {
    require_admin();
    $input = json_post();
    $orders = $input['orders'] ?? []; // Array of [{ id: 1, rank_order: 1 }, ...]

    if (is_array($orders)) {
        $stmt = $db->prepare('UPDATE officials SET rank_order = ? WHERE id = ?');
        foreach ($orders as $item) {
            if (!empty($item['id']) && isset($item['rank_order'])) {
                $stmt->execute([(int)$item['rank_order'], (int)$item['id']]);
            }
        }
    }
    out(['success' => true]);
}

else {
    out(['success' => false, 'error' => 'Invalid action.'], 400);
}
