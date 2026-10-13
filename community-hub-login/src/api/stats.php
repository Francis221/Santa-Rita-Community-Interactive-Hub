<?php
require_once __DIR__ . '/config.php';

ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    // Ensure dashboard_stats table exists
    if ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
        $db->exec("CREATE TABLE IF NOT EXISTS dashboard_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stat_key TEXT NOT NULL UNIQUE,
            stat_value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );");
    } else {
        $db->exec("CREATE TABLE IF NOT EXISTS dashboard_stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            stat_key VARCHAR(50) NOT NULL UNIQUE,
            stat_value VARCHAR(100) NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }
} catch (Throwable $e) {
    error_log('dashboard_stats table init error: ' . $e->getMessage());
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// -------------------------------------------------------------
// POST: Save / Update Statistics (Admin Only + CSRF Protected)
// -------------------------------------------------------------
if ($method === 'POST') {
    // 1. Role Authorization Guard: Restrict to Admin
    require_admin();

    $input = json_post();
    $csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
    $csrfToken = $input['csrf_token'] ?? $csrfHeader ?? null;

    // 2. CSRF Verification
    if (!verify_csrf_token($csrfToken)) {
        out(['success' => false, 'message' => 'CSRF validation failed or token expired. Please refresh the page.'], 403);
    }

    $rawPopulation = trim((string)($input['population'] ?? ''));
    $rawHousehold = trim((string)($input['household'] ?? ''));

    // 3. Validation: Required
    if ($rawPopulation === '' || $rawHousehold === '') {
        out(['success' => false, 'message' => 'Both Population and Household fields are required.'], 422);
    }

    // Strip non-numeric characters (allow commas in display but validate numeric value)
    $cleanPop = preg_replace('/[^\d]/', '', $rawPopulation);
    $cleanHouse = preg_replace('/[^\d]/', '', $rawHousehold);

    // 4. Validation: Must be numeric and non-negative
    if ($cleanPop === '' || !ctype_digit($cleanPop) || (int)$cleanPop < 0) {
        out(['success' => false, 'message' => 'Population must be a valid non-negative number.'], 422);
    }

    if ($cleanHouse === '' || !ctype_digit($cleanHouse) || (int)$cleanHouse < 0) {
        out(['success' => false, 'message' => 'Household must be a valid non-negative number.'], 422);
    }

    $popFormatted = number_format((int)$cleanPop);
    $houseFormatted = number_format((int)$cleanHouse);

    // 5. Prepared Statements to Save in Database
    $statsToSave = [
        'population' => $popFormatted,
        'household' => $houseFormatted
    ];

    foreach ($statsToSave as $k => $v) {
        $check = $db->prepare('SELECT id FROM dashboard_stats WHERE stat_key = ?');
        $check->execute([$k]);
        if ($check->fetch()) {
            $up = $db->prepare('UPDATE dashboard_stats SET stat_value = ?, updated_at = NOW() WHERE stat_key = ?');
            $up->execute([$v, $k]);
        } else {
            $ins = $db->prepare('INSERT INTO dashboard_stats (stat_key, stat_value, updated_at) VALUES (?, ?, NOW())');
            $ins->execute([$k, $v]);
        }
    }

    // Notify about the stat update
    create_notification(
        'Barangay Statistics Updated',
        "Population updated to {$popFormatted} and Households to {$houseFormatted}.",
        '/'
    );

    out([
        'success' => true,
        'message' => 'Barangay statistics successfully updated and saved to database!',
        'stats' => [
            'population' => $popFormatted,
            'household' => $houseFormatted
        ]
    ]);
}

// -------------------------------------------------------------
// GET: Fetch Stats from Database
// -------------------------------------------------------------
$stmt = $db->query('SELECT stat_key, stat_value FROM dashboard_stats');
$dbRows = $stmt->fetchAll();
$savedStats = [];
foreach ($dbRows as $row) {
    $savedStats[$row['stat_key']] = $row['stat_value'];
}

$pop = $savedStats['population'] ?? '12,480';
$house = $savedStats['household'] ?? '3,150';

// Real-time calculated counters
$activeReports = 0;
try {
    $activeReports = (int)$db->query("SELECT COUNT(*) FROM incident_reports WHERE status != 'Settled'")->fetchColumn();
} catch (Throwable $e) {}

$onlineCount = 1;
try {
    $onlineCount = (int)$db->query("SELECT COUNT(*) FROM users WHERE is_online = 1")->fetchColumn();
    if ($onlineCount < 1 && !empty($_SESSION['user_id'])) $onlineCount = 1;
} catch (Throwable $e) {}

$totalResidents = 0;
try {
    $totalResidents = (int)$db->query("SELECT COUNT(*) FROM users")->fetchColumn();
} catch (Throwable $e) {}

out([
    'success' => true,
    'stats' => [
        'population' => $pop,
        'household' => $house,
        'reports' => $activeReports,
        'online' => max(1, $onlineCount),
        'total_residents' => $totalResidents
    ],
    'csrf_token' => get_csrf_token()
]);
