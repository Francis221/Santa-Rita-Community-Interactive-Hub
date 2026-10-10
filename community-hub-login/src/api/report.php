<?php
require 'config.php';
require_login();
$q = trim($_GET['q'] ?? '');
$sql = "SELECT id, username, email,
        CASE WHEN password LIKE '$2y$%' OR password LIKE '$argon%' THEN 'Hashed' ELSE 'Plain text' END AS pw_status
        FROM users";
$p = [];
if ($q !== '') { $sql .= ' WHERE username LIKE ? OR email LIKE ?'; $p = ["%$q%", "%$q%"]; }
$st = $db->prepare($sql . ' ORDER BY id ASC');
$st->execute($p);
$rows = $st->fetchAll();

if (isset($_GET['export'])) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="users-report-' . date('Y-m-d') . '.csv"');
    $o = fopen('php://output', 'w');
    fputcsv($o, ['ID', 'Username', 'Email', 'Password status']);
    $safe = fn($v) => preg_match('/^[=+\-@]/', (string)$v) ? "'" . $v : $v;  // block CSV formula injection
    foreach ($rows as $r) fputcsv($o, [$r['id'], $safe($r['username']), $safe($r['email']), $r['pw_status']]);
    exit;
}
out(['rows' => $rows, 'generated' => date('c')]);
