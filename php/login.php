<?php
// login.php

// === 1) CORS headers ===
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// If the request method is OPTIONS (preflight), return 204 No Content
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/session_init.php';

// Database connection
require_once __DIR__ . '/config_login.php';

$conn = new mysqli($servername, $db_username, $db_password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Unable to connect to the database"]);
    exit;
}

// Read JSON body
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

$username = $conn->real_escape_string($data['username'] ?? '');
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing username or password"]);
    $conn->close();
    exit;
}

// Find the user by username or email
$sql = "
  SELECT id, username, email, password_hash, is_verified
  FROM users4
  WHERE username = '$username'
     OR email = '$username'
  LIMIT 1
";
$res = $conn->query($sql);
if (!$res || $res->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Invalid login credentials"]);
    $conn->close();
    exit;
}

$user = $res->fetch_assoc();
$hash = $user['password_hash'];

// Verify the password
if (!password_verify($password, $hash)) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Invalid login credentials"]);
    $conn->close();
    exit;
}

if ((int)$user['is_verified'] !== 1) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Account not verified"]);
    $conn->close();
    exit;
}

// Password is correct → store user ID in session (this will set the PHPSESSID cookie with SameSite=None)
$_SESSION['user_id'] = $user['id'];

// Persistent login token
$tokenPlain = bin2hex(random_bytes(32));
$tokenHash  = hash('sha256', $tokenPlain);
$uaHash     = hash('sha256', $_SERVER['HTTP_USER_AGENT'] ?? '');
$expiry     = date('Y-m-d H:i:s', time() + 60 * 60 * 24 * 30);
$tokenHashEsc = $conn->real_escape_string($tokenHash);
$uaHashEsc    = $conn->real_escape_string($uaHash);
$userId = (int)$user['id'];
$conn->query("INSERT INTO user_tokens (user_id, token_hash, user_agent_hash, expires_at) VALUES ($userId, '$tokenHashEsc', '$uaHashEsc', '$expiry')");
setcookie('login_token', $tokenPlain, [
    'expires'  => time() + 60 * 60 * 24 * 30,
    'path'     => '/',
    'domain'   => '',
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'None',
]);

// Return JSON with user info
$response = [
    "status" => "success",
    "user" => [
        "id"       => $user['id'],
        "username" => $user['username'],
        "email"    => $user['email']
    ]
];
echo json_encode($response);
$conn->close();
exit;
