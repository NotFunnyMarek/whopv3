<?php
// google_start.php - verify Google ID token and send 2FA code

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
require_once __DIR__ . '/vendor/autoload.php';

use Google_Client;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);
$idToken = $data['id_token'] ?? '';

if (!$idToken) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing id_token']);
    exit;
}

$clientID = 'YOUR_GOOGLE_CLIENT_ID'; // TODO: replace with real client ID
$client = new Google_Client(['client_id' => $clientID]);
$payload = $client->verifyIdToken($idToken);
if (!$payload) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid ID token']);
    exit;
}

$email = $payload['email'] ?? '';
$name  = $payload['name'] ?? '';
if (!$email) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email not provided']);
    exit;
}

$conn = new mysqli($servername, $db_username, $db_password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$emailEsc = $conn->real_escape_string($email);
$res = $conn->query("SELECT id, username FROM users4 WHERE email='$emailEsc' LIMIT 1");
if ($res && $res->num_rows > 0) {
    $user = $res->fetch_assoc();
    $userId = (int)$user['id'];
    $username = $user['username'];
} else {
    // create new user
    $base = preg_replace('/[^a-zA-Z0-9]/', '', explode('@', $email)[0]);
    if ($base === '') { $base = 'user'; }
    $username = $base;
    $i = 1;
    while (true) {
        $check = $conn->query("SELECT id FROM users4 WHERE username='".$conn->real_escape_string($username)."' LIMIT 1");
        if (!$check || $check->num_rows === 0) break;
        $username = $base . $i;
        $i++;
    }
    $insertSql = "INSERT INTO users4 (username, email, password_hash, balance) VALUES ('$username', '$emailEsc', NULL, 0)";
    if ($conn->query($insertSql) !== TRUE) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error creating user']);
        $conn->close();
        exit;
    }
    $userId = $conn->insert_id;
    // run node script for deposit addresses
    $nodePath   = '/usr/bin/node';
    $scriptPath = '/solana-monitor/setup_deposit_addresses.js';
    $cmd = escapeshellcmd("$nodePath $scriptPath $userId");
    exec($cmd . " 2>&1", $outputLines, $returnVal);
}

$code  = random_int(100000, 999999);
$token = bin2hex(random_bytes(16));
$hash  = password_hash($code, PASSWORD_BCRYPT);
$expires = date('Y-m-d H:i:s', time() + 600); // 10 minutes

$tokenEsc = $conn->real_escape_string($token);
$hashEsc  = $conn->real_escape_string($hash);
$conn->query("INSERT INTO two_factor_codes (user_id, code_hash, token, expires_at) VALUES ($userId, '$hashEsc', '$tokenEsc', '$expires')");

$mail = new PHPMailer(true);
try {
    // Configure your mailer here (SMTP settings etc.)
    $mail->setFrom('no-reply@example.com', 'Auth');
    $mail->addAddress($email);
    $mail->Subject = 'Your verification code';
    $mail->Body    = "Your verification code is: $code";
    $mail->send();
} catch (Exception $e) {
    // ignore email errors
}

$conn->close();

echo json_encode(['status' => 'need_code', 'token' => $token]);
