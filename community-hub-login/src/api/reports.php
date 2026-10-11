<?php
require 'config.php';

// Prevent notices in JSON output
ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    // Ensure incident_reports table exists
    $db->exec("CREATE TABLE IF NOT EXISTS incident_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_code VARCHAR(50) NOT NULL,
        case_type VARCHAR(100) NOT NULL,
        complainant VARCHAR(150) NOT NULL,
        respondent VARCHAR(150) DEFAULT 'N/A',
        purok VARCHAR(100) DEFAULT 'Purok 1',
        status VARCHAR(50) DEFAULT 'Pending',
        description TEXT DEFAULT NULL,
        details TEXT DEFAULT NULL,
        settlement_date VARCHAR(50) DEFAULT NULL,
        settle_by VARCHAR(100) DEFAULT NULL,
        resolution_summary TEXT DEFAULT NULL,
        date_filed DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    try { $db->exec("ALTER TABLE incident_reports ADD COLUMN description TEXT DEFAULT NULL"); } catch (Throwable $e) {}
    try { $db->exec("ALTER TABLE incident_reports ADD COLUMN details TEXT DEFAULT NULL"); } catch (Throwable $e) {}
} catch (Throwable $e) {
    error_log('incident_reports table setup notice: ' . $e->getMessage());
}

$action = $_GET['action'] ?? $_POST['action'] ?? $_REQUEST['action'] ?? 'list';

if ($action === 'create') {
    $input = json_post();

    $caseType = trim($input['caseType'] ?? $input['title'] ?? $_POST['caseType'] ?? $_REQUEST['caseType'] ?? 'General Incident');
    $complainant = trim($input['complainant'] ?? $_POST['complainant'] ?? $_REQUEST['complainant'] ?? 'Anonymous');
    $respondent = trim($input['respondent'] ?? $_POST['respondent'] ?? $_REQUEST['respondent'] ?? 'N/A');
    $purok = trim($input['purok'] ?? $_POST['purok'] ?? $_REQUEST['purok'] ?? 'Purok 1');
    $status = trim($input['status'] ?? $_POST['status'] ?? 'Pending');
    $details = trim($input['details'] ?? $input['description'] ?? $_POST['details'] ?? $_REQUEST['details'] ?? '');

    $code = !empty($input['id']) ? trim($input['id']) : ('REP-2026-' . rand(100, 999));

    $stmt = $db->prepare('INSERT INTO incident_reports (report_code, case_type, complainant, respondent, purok, status, description, details, date_filed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$code, $caseType, $complainant, $respondent, $purok, $status, $details, $details]);

    $newId = $db->lastInsertId();

    out([
        'success' => true,
        'report' => [
            'id' => $code,
            'db_id' => (int)$newId,
            'title' => $caseType,
            'caseType' => $caseType,
            'complainant' => $complainant,
            'respondent' => $respondent,
            'parties' => "$complainant vs. $respondent",
            'status' => $status,
            'dateFiled' => date('M d, Y'),
            'purok' => $purok,
            'description' => $details,
            'details' => $details
        ]
    ]);
} elseif ($action === 'settle') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: [];

    $id = $input['id'] ?? $_POST['id'] ?? $_REQUEST['id'] ?? null;
    $settleBy = $input['settleBy'] ?? $_POST['settleBy'] ?? $_REQUEST['settleBy'] ?? 'Admin';
    $resolution = $input['resolutionSummary'] ?? $_POST['resolutionSummary'] ?? $_REQUEST['resolutionSummary'] ?? 'Settled by mutual agreement.';

    if ($id) {
        $stmt = $db->prepare('UPDATE incident_reports SET status = "Settled", settlement_date = NOW(), settle_by = ?, resolution_summary = ? WHERE id = ? OR report_code = ?');
        $stmt->execute([$settleBy, $resolution, $id, $id]);
    }

    out(['success' => true]);
} elseif ($action === 'delete') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: [];
    $id = $input['id'] ?? $_GET['id'] ?? $_REQUEST['id'] ?? null;

    if ($id) {
        $stmt = $db->prepare('DELETE FROM incident_reports WHERE id = ? OR report_code = ?');
        $stmt->execute([$id, $id]);
    }

    out(['success' => true]);
} else {
    // Action 'list'
    $stmt = $db->query('SELECT * FROM incident_reports ORDER BY id DESC');
    $reports = $stmt->fetchAll();

    out([
        'success' => true,
        'count' => count($reports),
        'reports' => array_map(function($r) {
            return [
                'id' => $r['report_code'],
                'db_id' => (int)$r['id'],
                'title' => $r['case_type'],
                'caseType' => $r['case_type'],
                'complainant' => $r['complainant'],
                'respondent' => $r['respondent'],
                'parties' => $r['complainant'] . ' vs. ' . $r['respondent'],
                'status' => $r['status'],
                'dateFiled' => date('M d, Y', strtotime($r['date_filed'])),
                'purok' => $r['purok'],
                'description' => $r['description'],
                'settlementDate' => $r['settlement_date'] ? date('M d, Y', strtotime($r['settlement_date'])) : '',
                'settleBy' => $r['settle_by'] ?? '',
                'resolutionSummary' => $r['resolution_summary'] ?? ''
            ];
        }, $reports)
    ]);
}
