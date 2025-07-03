<?php
// verify_code.php - verify 2FA code and create session

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

function generateUniqueUsername(mysqli $conn, string $email): string {
    $base = explode('@', $email)[0];
    // keep only alphanumeric characters to avoid SQL issues
    $base = preg_replace('/[^a-zA-Z0-9]/', '', $base);
    if ($base === '') {
        $base = 'user';
    }
    $username = $base;
    $i = 1;
    while (true) {
        $esc = $conn->real_escape_string($username);
        $check = $conn->query("SELECT id FROM users4 WHERE username='$esc' LIMIT 1");
        if (!$check || $check->num_rows === 0) {
            break;
        }
        $username = $base . $i;
        $i++;
    }
    return $username;
}

$cookieParams = session_get_cookie_params();
session_set_cookie_params([
    'lifetime' => 60 * 60 * 24 * 30, // 30 days
    'path'     => $cookieParams['path'],
    'domain'   => $cookieParams['domain'],
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'None'
]);

session_start();

$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);
$token = $data['token'] ?? '';
$code  = $data['code'] ?? '';

if ($token === '' || $code === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing token or code']);
    exit;
}

$conn = new mysqli($servername, $db_username, $db_password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$tokenEsc = $conn->real_escape_string($token);
$res = $conn->query("SELECT id, user_id, code_hash, expires_at FROM two_factor_codes WHERE token='$tokenEsc' LIMIT 1");
if (!$res || $res->num_rows === 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid token']);
    $conn->close();
    exit;
}

$record = $res->fetch_assoc();
if (strtotime($record['expires_at']) < time()) {
    $conn->query("DELETE FROM two_factor_codes WHERE id=" . (int)$record['id']);
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Code expired']);
    $conn->close();
    exit;
}

if (!password_verify($code, $record['code_hash'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Incorrect code']);
    $conn->close();
    exit;
}

$userId = (int)$record['user_id'];
$conn->query("DELETE FROM two_factor_codes WHERE id=" . (int)$record['id']);

$userRes = $conn->query("SELECT id, username, email, deposit_address FROM users4 WHERE id=$userId LIMIT 1");
$user = $userRes ? $userRes->fetch_assoc() : null;

if ($user) {
    if ($user['username'] === null || $user['username'] === '') {
        $newUsername = generateUniqueUsername($conn, $user['email']);
        $user['username'] = $newUsername;
        $esc = $conn->real_escape_string($newUsername);
        $conn->query("UPDATE users4 SET username='$esc' WHERE id=$userId");
    }
    if ($user['deposit_address'] === null || $user['deposit_address'] === '') {
        $nodePath   = '/usr/bin/node';
        $scriptPath = __DIR__ . '/../solana-monitor/setup_deposit_addresses.js';
        $cmd = escapeshellcmd("$nodePath $scriptPath $userId");
        exec($cmd . " 2>&1", $out, $ret);
    }
}

$_SESSION['user_id'] = $userId;

$conn->close();

echo json_encode([
    'status' => 'success',
    'user' => $user
]);
