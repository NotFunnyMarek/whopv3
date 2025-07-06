<?php
// update_registration.php - save additional registration info + generate deposit address

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config_login.php';

$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);
$token = $data['token'] ?? '';
$dob = $data['date_of_birth'] ?? '';
$country = $data['country'] ?? '';
$accepted = $data['accepted_terms'] ?? false;

if ($token === '' || $dob === '' || $country === '' || !$accepted) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
    exit;
}

$ts = strtotime($dob);
if (!$ts) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid date']);
    exit;
}
$age = floor((time() - $ts) / (365.25 * 24 * 60 * 60));
if ($age < 13) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Must be at least 13']);
    exit;
}

$conn = new mysqli($servername, $db_username, $db_password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$tokenEsc = $conn->real_escape_string($token);
$res = $conn->query("SELECT user_id FROM two_factor_codes WHERE token='$tokenEsc' LIMIT 1");
if (!$res || $res->num_rows === 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid token']);
    $conn->close();
    exit;
}
$userId = (int)$res->fetch_assoc()['user_id'];

$dobEsc = $conn->real_escape_string(date('Y-m-d', $ts));
$countryEsc = $conn->real_escape_string($country);
$sql = "UPDATE users4 SET date_of_birth='$dobEsc', country='$countryEsc', accepted_terms=1 WHERE id=$userId";
if (!$conn->query($sql)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Update failed: ' . $conn->error]);
    $conn->close();
    exit;
}

// === Spusť setup_deposit_addresses.js ===
$nodePath   = '/usr/bin/node';
$whichOut = [];
$whichRet = 0;
@exec('which node', $whichOut, $whichRet);
if ($whichRet === 0 && !empty($whichOut[0])) {
    $nodePath = trim($whichOut[0]);
}
$scriptPath = __DIR__ . '/../solana-monitor/setup_deposit_addresses.js';
$cmd = escapeshellcmd("$nodePath $scriptPath $userId");
exec($cmd . " 2>&1", $outputLines, $returnVal);

if ($returnVal !== 0) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error generating deposit address: ' . implode("\n", $outputLines)
    ]);
    $conn->close();
    exit;
}

$conn->close();

echo json_encode([
    'status' => 'success',
    'message' => 'User info and deposit address updated',
    'user_id' => $userId
]);
