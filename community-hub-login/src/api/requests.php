<?php
require 'config.php';

// Prevent notices in JSON response
ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    // Ensure doc_requests table exists in MySQL database
    $db->exec("CREATE TABLE IF NOT EXISTS doc_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_code VARCHAR(50) NOT NULL,
        applicant_name VARCHAR(150) NOT NULL,
        doc_type VARCHAR(100) NOT NULL,
        document_name VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        purpose VARCHAR(255) DEFAULT 'General Purpose',
        address VARCHAR(255) DEFAULT NULL,
        civil_status VARCHAR(50) DEFAULT 'Single',
        age INT DEFAULT 25,
        ctc_no VARCHAR(50) DEFAULT NULL,
        or_no VARCHAR(50) DEFAULT NULL,
        date_requested DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} catch (Throwable $e) {
    error_log('doc_requests table setup notice: ' . $e->getMessage());
}

$action = $_GET['action'] ?? $_POST['action'] ?? 'list';

if ($action === 'create') {
    $input = json_post();
    $name = trim($input['applicant_name'] ?? $input['applicantName'] ?? $_POST['applicant_name'] ?? $_POST['applicantName'] ?? 'Resident');
    $docType = trim($input['doc_type'] ?? $input['docType'] ?? $_POST['doc_type'] ?? 'BARANGAY CLEARANCE');
    $docName = trim($input['document_name'] ?? $input['documentName'] ?? $_POST['document_name'] ?? 'Barangay Clearance');
    $purpose = trim($input['purpose'] ?? $_POST['purpose'] ?? 'General Purpose');
    $address = trim($input['address'] ?? $_POST['address'] ?? 'Purok 3, Sta. Rita Central');
    $civilStatus = trim($input['civil_status'] ?? $input['civilStatus'] ?? $_POST['civil_status'] ?? 'Single');
    $age = (int)($input['age'] ?? $_POST['age'] ?? 25);
    $status = trim($input['status'] ?? $_POST['status'] ?? 'Pending');

    $code = !empty($input['id']) ? trim($input['id']) : ('DOC-2026-' . rand(100, 999));
    $ctcNo = !empty($input['ctcNo']) ? trim($input['ctcNo']) : (!empty($input['ctc_no']) ? trim($input['ctc_no']) : ('CTC-2026-' . rand(1000, 9999)));
    $orNo = !empty($input['orNo']) ? trim($input['orNo']) : (!empty($input['or_no']) ? trim($input['or_no']) : ('OR-' . rand(90000, 99999)));

    $stmt = $db->prepare('INSERT INTO doc_requests (request_code, applicant_name, doc_type, document_name, status, purpose, address, civil_status, age, ctc_no, or_no, date_requested) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$code, strtoupper($name), $docType, $docName, $status, $purpose, $address, $civilStatus, $age, $ctcNo, $orNo]);

    $newId = $db->lastInsertId();

    out([
        'success' => true,
        'request' => [
            'id' => $code,
            'db_id' => (int)$newId,
            'applicantName' => strtoupper($name),
            'docType' => $docType,
            'documentName' => $docName,
            'status' => 'Pending',
            'dateRequested' => date('M d, Y'),
            'address' => $address,
            'civilStatus' => $civilStatus,
            'age' => $age,
            'purpose' => $purpose,
            'ctcNo' => $ctcNo,
            'orNo' => $orNo
        ]
    ]);
} elseif ($action === 'update_status') {
    $input = json_post();
    $id = $input['id'] ?? $_POST['id'] ?? null;
    $status = $input['status'] ?? $_POST['status'] ?? 'Approved';

    if ($id) {
        $stmt = $db->prepare('UPDATE doc_requests SET status = ? WHERE id = ? OR request_code = ?');
        $stmt->execute([$status, $id, $id]);
    }

    out(['success' => true]);
} elseif ($action === 'delete') {
    $input = json_post();
    $id = $input['id'] ?? $_GET['id'] ?? null;

    if ($id) {
        $stmt = $db->prepare('DELETE FROM doc_requests WHERE id = ? OR request_code = ?');
        $stmt->execute([$id, $id]);
    }

    out(['success' => true]);
} else {
    // Action 'list'
    $stmt = $db->query('SELECT * FROM doc_requests ORDER BY id DESC');
    $requests = $stmt->fetchAll();

    out([
        'success' => true,
        'count' => count($requests),
        'requests' => array_map(function($r) {
            return [
                'id' => $r['request_code'],
                'db_id' => (int)$r['id'],
                'applicantName' => $r['applicant_name'],
                'docType' => $r['doc_type'],
                'documentName' => $r['document_name'],
                'status' => $r['status'],
                'dateRequested' => date('M d, Y', strtotime($r['date_requested'])),
                'address' => $r['address'],
                'civilStatus' => $r['civil_status'],
                'age' => (int)$r['age'],
                'purpose' => $r['purpose'],
                'ctcNo' => $r['ctc_no'],
                'orNo' => $r['or_no']
            ];
        }, $requests)
    ]);
}
