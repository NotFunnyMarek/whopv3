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

/**
 * === 2) PHP SESSION COOKIE PARAMS ===
 * ONLY HERE, BEFORE session_start(), we call session_set_cookie_params.
 * Here we define:
 *   - 'secure'   => true  (required if the page is served over HTTPS; set to false if not using HTTPS)
 *   - 'samesite' => 'None' (required for cross-domain, otherwise the cookie from localhost:3000
 *                           will not be sent to app.byxbot.com)
 */
$cookieParams = session_get_cookie_params();
session_set_cookie_params([
    'lifetime' => $cookieParams['lifetime'],
    'path'     => $cookieParams['path'],
    'domain'   => $cookieParams['domain'], // can be an empty string for the current host
    'secure'   => true,    // true if your PHP is indeed on HTTPS; change to false otherwise
    'httponly' => true,
    'samesite' => 'None'
]);

session_start();
// ======================= end SESSION cookie configuration =======================

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
  SELECT id, username, email, password_hash
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

// Password is correct → store user ID in session (this will set the PHPSESSID cookie with SameSite=None)
$_SESSION['user_id'] = $user['id'];

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
