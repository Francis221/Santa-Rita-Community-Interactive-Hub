<?php
require_once __DIR__ . '/config.php';

// Prevent notices in JSON output
ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    if ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
        $db->exec("CREATE TABLE IF NOT EXISTS incident_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_code TEXT NOT NULL UNIQUE,
            complainant_user_id INTEGER DEFAULT NULL,
            case_type TEXT NOT NULL,
            complainant TEXT NOT NULL,
            contact_number TEXT DEFAULT NULL,
            address TEXT DEFAULT NULL,
            respondent TEXT DEFAULT 'N/A',
            purok TEXT DEFAULT 'Purok 1',
            status TEXT DEFAULT 'Pending',
            description TEXT DEFAULT NULL,
            details TEXT DEFAULT NULL,
            admin_remarks TEXT DEFAULT NULL,
            settlement_date TEXT DEFAULT NULL,
            settle_by TEXT DEFAULT NULL,
            resolution_summary TEXT DEFAULT NULL,
            date_filed DATETIME DEFAULT CURRENT_TIMESTAMP
        );");
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN complainant_user_id INTEGER DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN contact_number TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN address TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN admin_remarks TEXT DEFAULT NULL"); } catch (Throwable $e) {}
    } else {
        $db->exec("CREATE TABLE IF NOT EXISTS incident_reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            report_code VARCHAR(50) NOT NULL UNIQUE,
            complainant_user_id INT DEFAULT NULL,
            case_type VARCHAR(100) NOT NULL,
            complainant VARCHAR(150) NOT NULL,
            contact_number VARCHAR(50) DEFAULT NULL,
            address VARCHAR(255) DEFAULT NULL,
            respondent VARCHAR(150) DEFAULT 'N/A',
            purok VARCHAR(100) DEFAULT 'Purok 1',
            status VARCHAR(50) DEFAULT 'Pending',
            description TEXT DEFAULT NULL,
            details TEXT DEFAULT NULL,
            admin_remarks TEXT DEFAULT NULL,
            settlement_date VARCHAR(50) DEFAULT NULL,
            settle_by VARCHAR(100) DEFAULT NULL,
            resolution_summary TEXT DEFAULT NULL,
            date_filed DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX (complainant_user_id),
            INDEX (status),
            INDEX (date_filed)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN complainant_user_id INT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN contact_number VARCHAR(50) DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN address VARCHAR(255) DEFAULT NULL"); } catch (Throwable $e) {}
        try { $db->exec("ALTER TABLE incident_reports ADD COLUMN admin_remarks TEXT DEFAULT NULL"); } catch (Throwable $e) {}
    }
} catch (Throwable $e) {
    error_log('incident_reports table setup notice: ' . $e->getMessage());
}

function format_report(array $r): array {
    $cId = !empty($r['complainant_user_id']) ? (int)$r['complainant_user_id'] : 2;
    $dateFormatted = !empty($r['date_filed']) ? date('M d, Y', strtotime($r['date_filed'])) : date('M d, Y');
    return [
        'id' => $r['report_code'],
        'reference_no' => $r['report_code'],
        'report_code' => $r['report_code'],
        'db_id' => (int)$r['id'],
        'complainant_user_id' => $cId,
        'resident_id' => 'RES-' . str_pad($cId, 4, '0', STR_PAD_LEFT),
        'title' => $r['case_type'],
        'caseType' => $r['case_type'],
        'complainant' => $r['complainant'],
        'contact_number' => $r['contact_number'] ?: '0912 345 6789',
        'address' => $r['address'] ?: 'Sta. Rita Central, Agoo',
        'respondent' => $r['respondent'] ?: 'N/A',
        'parties' => $r['complainant'] . ' vs. ' . ($r['respondent'] ?: 'N/A'),
        'status' => $r['status'] ?: 'Pending',
        'dateFiled' => $dateFormatted,
        'date_filed' => $dateFormatted,
        'purok' => $r['purok'] ?: 'Purok 1',
        'description' => $r['description'] ?: ($r['details'] ?: ''),
        'details' => $r['details'] ?: ($r['description'] ?: ''),
        'admin_remarks' => $r['admin_remarks'] ?: '',
        'settlementDate' => !empty($r['settlement_date']) ? date('M d, Y', strtotime($r['settlement_date'])) : '',
        'settleBy' => $r['settle_by'] ?? '',
        'resolutionSummary' => $r['resolution_summary'] ?? ''
    ];
}

$action = $_GET['action'] ?? $_POST['action'] ?? $_REQUEST['action'] ?? 'list';

// -------------------------------------------------------------
// 1. CREATE COMPLAINT / INCIDENT REPORT
// -------------------------------------------------------------
if ($action === 'create') {
    require_login();
    $sessionUserId = (int)$_SESSION['user_id'];
    $sessionRole = $_SESSION['role'] ?? 'Resident';

    $input = json_post();

    // Section 8: Complainant is automatic
    // Regular residents CANNOT choose complainant; always taken from $_SESSION['user_id']
    // Admins may choose a resident from searchable dropdown (sent as complainant_user_id)
    $targetUserId = $sessionUserId;
    if ($sessionRole === 'Admin' && !empty($input['complainant_user_id'])) {
        $targetUserId = (int)$input['complainant_user_id'];
    }

    // Pull complainant info automatically from database for targetUserId
    $uStmt = $db->prepare('SELECT id, username, email, COALESCE(full_name, username) as full_name, COALESCE(contact_number, phone) as contact_num, COALESCE(address, purok) as addr FROM users WHERE id = ?');
    $uStmt->execute([$targetUserId]);
    $userRow = $uStmt->fetch();

    $complainantName = $userRow ? $userRow['full_name'] : ($_SESSION['username'] ?? 'Resident');
    $contactNumber = $userRow && !empty($userRow['contact_num']) ? $userRow['contact_num'] : '0912 345 6789';
    $address = $userRow && !empty($userRow['addr']) ? $userRow['addr'] : 'Sta. Rita Central, Agoo';

    $caseType = trim($input['caseType'] ?? $input['title'] ?? 'General Incident');
    $respondent = trim($input['respondent'] ?? 'N/A');
    $purok = trim($input['purok'] ?? 'Purok 1');
    $status = 'Pending';
    // Admins can set custom status initially if needed
    if ($sessionRole === 'Admin' && !empty($input['status'])) {
        $status = trim($input['status']);
    }
    $details = trim($input['details'] ?? $input['description'] ?? '');

    $code = !empty($input['id']) ? trim($input['id']) : ('REP-2026-' . rand(100, 999));

    $stmt = $db->prepare('INSERT INTO incident_reports (report_code, complainant_user_id, case_type, complainant, contact_number, address, respondent, purok, status, description, details, date_filed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$code, $targetUserId, $caseType, $complainantName, $contactNumber, $address, $respondent, $purok, $status, $details, $details]);

    $newId = $db->lastInsertId();

    // Section 8: Create a notification (using the bell system) for admins when a new complaint is filed
    try {
        $admins = $db->query("SELECT id FROM users WHERE role = 'Admin'")->fetchAll();
        foreach ($admins as $adm) {
            create_notification(
                "New Incident Report Filed",
                "Case #{$code}: {$caseType} filed by {$complainantName} in {$purok}.",
                "/reports",
                (int)$adm['id']
            );
        }
    } catch (Throwable $e) {
        error_log("Failed to notify admins: " . $e->getMessage());
    }

    out([
        'success' => true,
        'report' => [
            'id' => $code,
            'report_code' => $code,
            'reference_no' => $code,
            'db_id' => (int)$newId,
            'complainant_user_id' => $targetUserId,
            'resident_id' => 'RES-' . str_pad($targetUserId, 4, '0', STR_PAD_LEFT),
            'title' => $caseType,
            'caseType' => $caseType,
            'complainant' => $complainantName,
            'contact_number' => $contactNumber,
            'address' => $address,
            'respondent' => $respondent,
            'parties' => "{$complainantName} vs. {$respondent}",
            'status' => $status,
            'dateFiled' => date('M d, Y'),
            'purok' => $purok,
            'description' => $details,
            'details' => $details,
            'admin_remarks' => ''
        ]
    ]);
}

// -------------------------------------------------------------
// 2. MY REPORTS (Resident role only sees their reports)
// -------------------------------------------------------------
elseif ($action === 'my_reports') {
    require_login();
    $sessionUserId = (int)$_SESSION['user_id'];
    $search = trim($_GET['search'] ?? '');
    $statusFilter = trim($_GET['status'] ?? '');
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, min(50, (int)($_GET['limit'] ?? 10)));
    $offset = ($page - 1) * $limit;

    $where = "complainant_user_id = :uid";
    $params = [':uid' => $sessionUserId];

    if ($statusFilter !== '' && $statusFilter !== 'All') {
        if ($statusFilter === 'Resolved') {
            $where .= " AND (status = 'Resolved' OR status = 'Settled')";
        } else {
            $where .= " AND status = :st";
            $params[':st'] = $statusFilter;
        }
    }

    if ($search !== '') {
        $where .= " AND (report_code LIKE :q OR case_type LIKE :q OR respondent LIKE :q OR details LIKE :q)";
        $params[':q'] = "%$search%";
    }

    $cStmt = $db->prepare("SELECT COUNT(*) FROM incident_reports WHERE $where");
    $cStmt->execute($params);
    $total = (int)$cStmt->fetchColumn();

    $stmt = $db->prepare("SELECT * FROM incident_reports WHERE $where ORDER BY id DESC LIMIT :limit OFFSET :offset");
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $reports = $stmt->fetchAll();

    out([
        'success' => true,
        'total' => $total,
        'page' => $page,
        'pages' => ceil($total / $limit) ?: 1,
        'limit' => $limit,
        'reports' => array_map('format_report', $reports)
    ]);
}

// -------------------------------------------------------------
// 3. GET SINGLE REPORT (with IDOR Prevention)
// -------------------------------------------------------------
elseif ($action === 'get') {
    require_login();
    $id = $_GET['id'] ?? null;
    if (!$id) out(['success' => false, 'error' => 'Report ID required'], 400);

    $stmt = $db->prepare('SELECT * FROM incident_reports WHERE id = ? OR report_code = ? LIMIT 1');
    $stmt->execute([$id, $id]);
    $report = $stmt->fetch();

    if (!$report) {
        out(['success' => false, 'error' => 'Report not found'], 404);
    }

    // Section 9 IDOR Security Guard:
    // If a resident changes the ID in the URL to open someone else's report, return 403 or 404
    $isAdmin = (($_SESSION['role'] ?? '') === 'Admin');
    if (!$isAdmin && (int)$report['complainant_user_id'] !== (int)$_SESSION['user_id']) {
        out(['success' => false, 'error' => 'Forbidden: You do not have permission to view this report.'], 403);
    }

    out([
        'success' => true,
        'report' => format_report($report)
    ]);
}

// -------------------------------------------------------------
// 4. UPDATE REPORT STATUS & ADMIN REMARKS (Admin only)
// -------------------------------------------------------------
elseif ($action === 'update_status' || $action === 'settle') {
    require_admin();
    $input = json_post();
    $id = $input['id'] ?? null;
    $newStatus = trim($input['status'] ?? ($action === 'settle' ? 'Settled' : 'Pending'));
    $remarks = trim($input['admin_remarks'] ?? $input['remarks'] ?? $input['resolutionSummary'] ?? '');
    $settleBy = trim($input['settleBy'] ?? ($_SESSION['username'] ?? 'Admin'));

    if (!$id) {
        out(['success' => false, 'error' => 'Report ID is required'], 400);
    }

    $stmt = $db->prepare('SELECT * FROM incident_reports WHERE id = ? OR report_code = ? LIMIT 1');
    $stmt->execute([$id, $id]);
    $report = $stmt->fetch();
    if (!$report) {
        out(['success' => false, 'error' => 'Report not found'], 404);
    }

    $uSql = 'UPDATE incident_reports SET status = ?, admin_remarks = ?';
    $uParams = [$newStatus, $remarks];
    if ($newStatus === 'Settled' || $newStatus === 'Resolved') {
        $uSql .= ', settlement_date = NOW(), settle_by = ?, resolution_summary = ?';
        $uParams[] = $settleBy;
        $uParams[] = $remarks ?: 'Settled by mutual agreement.';
    }
    $uSql .= ' WHERE id = ?';
    $uParams[] = $report['id'];

    $uStmt = $db->prepare($uSql);
    $uStmt->execute($uParams);

    // Section 9: When an admin changes a report's status, notify the resident through the bell
    $complainantId = (int)$report['complainant_user_id'];
    if ($complainantId > 0) {
        create_notification(
            "Report Status Update (#{$report['report_code']})",
            "Your report status has been updated to '{$newStatus}'." . ($remarks ? " Admin Remarks: {$remarks}" : ""),
            "/my-reports",
            $complainantId
        );
    }

    out([
        'success' => true,
        'message' => "Report {$report['report_code']} status updated to {$newStatus}.",
        'report' => format_report(array_merge($report, [
            'status' => $newStatus,
            'admin_remarks' => $remarks
        ]))
    ]);
}

// -------------------------------------------------------------
// 5. DELETE REPORT (Admin only)
// -------------------------------------------------------------
elseif ($action === 'delete') {
    require_admin();
    $input = json_post();
    $id = $input['id'] ?? $_GET['id'] ?? null;

    if ($id) {
        $stmt = $db->prepare('DELETE FROM incident_reports WHERE id = ? OR report_code = ?');
        $stmt->execute([$id, $id]);
    }

    out(['success' => true]);
}

// -------------------------------------------------------------
// 6. DEFAULT: LIST ALL REPORTS (Admin / Public overview)
// -------------------------------------------------------------
else {
    $stmt = $db->query('SELECT * FROM incident_reports ORDER BY id DESC');
    $reports = $stmt->fetchAll();

    out([
        'success' => true,
        'count' => count($reports),
        'reports' => array_map('format_report', $reports)
    ]);
}
