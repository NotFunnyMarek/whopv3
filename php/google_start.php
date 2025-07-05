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

function generateUniqueUsername(mysqli $conn, string $email): string {
    $base = explode('@', $email)[0];
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


$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);
$idToken    = $data['id_token'] ?? '';
$emailInput = $data['email']   ?? '';
$mode       = $data['mode']    ?? 'login';

if (!$idToken && !$emailInput) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing id_token or email']);
    exit;
}

$email = '';
$name  = '';
if ($idToken) {
    $clientID = '477836153268-gmsf092g4nprn297cov055if8n66reel.apps.googleusercontent.com'; // TODO: replace with real client ID
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
} else {
    $email = trim($emailInput);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid email']);
        exit;
    }
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
    if ($mode === 'register') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Email already registered, please login']);
        $conn->close();
        exit;
    }
    $user = $res->fetch_assoc();
    $userId = (int)$user['id'];
    $username = $user['username'];
} elseif ($mode === 'register') {
    // create new user during registration
    $username = generateUniqueUsername($conn, $email);
    $usernameEsc = $conn->real_escape_string($username);
    $dummyPass = bin2hex(random_bytes(16));
    $dummyHash = $conn->real_escape_string(password_hash($dummyPass, PASSWORD_BCRYPT));
    $insertSql = "INSERT INTO users4 (username, email, password_hash, balance) VALUES ('$usernameEsc', '$emailEsc', '$dummyHash', 0)";
    if ($conn->query($insertSql) !== TRUE) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error creating user: ' . $conn->error]);
        $conn->close();
        exit;
    }
    $userId = $conn->insert_id;
    // run node script for deposit addresses
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
} else {
    // login attempt with unregistered email
    http_response_code(404);
    echo json_encode(['status' => 'not_found']);
    $conn->close();
    exit;
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
    // zapni SMTP
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'verify.byx@gmail.com';           // tvůj Gmail
    $mail->Password = 'aqzz izve csfu quxc';           // heslo aplikace
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('verify.byx@gmail.com', 'Auth');
    $mail->addAddress($email);
    $mail->Subject = 'Your verification code';
    $mail->Body    = "Your verification code is: $code";
    $mail->send();
} catch (Exception $e) {
    error_log("Mailer Error: {$mail->ErrorInfo}");
}


$conn->close();

echo json_encode(['status' => 'need_code', 'token' => $token]);
