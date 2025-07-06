<?php
// php/register.php

// 1) CORS – allow only our frontend at http://localhost:3000
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/session_init.php'; // If you use sessions for anything

// 2) Connect to the database
require_once __DIR__ . '/config_login.php';

$conn = new mysqli($servername, $db_username, $db_password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Cannot connect to the database"
    ]);
    exit;
}

// 3) Read the JSON body
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);
if (!$data) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Invalid JSON"
    ]);
    $conn->close();
    exit;
}

// 4) Extract and validate fields
$username = trim($conn->real_escape_string($data['username'] ?? ''));
$email    = trim($conn->real_escape_string($data['email']    ?? ''));
$password = $data['password'] ?? '';

// Check required fields
if ($username === '' || $email === '' || $password === '') {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Username, email, and password cannot be empty"
    ]);
    $conn->close();
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Invalid email format"
    ]);
    $conn->close();
    exit;
}

// 5) Check if email already exists
$sqlEmail = "SELECT id FROM users4 WHERE email = '$email' LIMIT 1";
$resEmail = $conn->query($sqlEmail);
if ($resEmail && $resEmail->num_rows > 0) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Email already registered, please login"
    ]);
    $conn->close();
    exit;
}

// 6) Check if username already exists
$sqlUsername = "SELECT id FROM users4 WHERE username = '$username' LIMIT 1";
$resUsername = $conn->query($sqlUsername);
if ($resUsername && $resUsername->num_rows > 0) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Username already exists"
    ]);
    $conn->close();
    exit;
}

// 7) Insert the new user (we leave `name` NULL)
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$insertSql = "
  INSERT INTO users4
    (username, email, password_hash, balance, is_verified)
  VALUES
    ('$username', '$email', '$hashedPassword', 0.00000000, 1)
";
if ($conn->query($insertSql) !== TRUE) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Registration error: " . $conn->error
    ]);
    $conn->close();
    exit;
}

// 8) Get the new user's ID
$newUserId = $conn->insert_id;

// 9) Run `setup_deposit_addresses.js` for this user
//    Try to detect the Node binary location automatically
$nodePath   = '/usr/bin/node';
$whichOut = [];
$whichRet = 0;
@exec('which node', $whichOut, $whichRet);
if ($whichRet === 0 && !empty($whichOut[0])) {
    $nodePath = trim($whichOut[0]);
}
$scriptPath = __DIR__ . '/../solana-monitor/setup_deposit_addresses.js'; // Absolute path to your script

$cmd = escapeshellcmd("$nodePath $scriptPath $newUserId");
exec($cmd . " 2>&1", $outputLines, $returnVal);
if ($returnVal !== 0) {
    // If generating deposit address failed, roll back the user insertion
    $conn->query("DELETE FROM users4 WHERE id = $newUserId");
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error generating deposit address: " . implode("\n", $outputLines)
    ]);
    $conn->close();
    exit;
}

// Double-check that the deposit address was actually created
$resCheck = $conn->query("SELECT deposit_address FROM users4 WHERE id = $newUserId LIMIT 1");
if (!$resCheck || $resCheck->num_rows === 0) {
    $conn->query("DELETE FROM users4 WHERE id = $newUserId");
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Deposit address not generated"
    ]);
    $conn->close();
    exit;
}
$rowCheck = $resCheck->fetch_assoc();
if (!$rowCheck['deposit_address']) {
    $conn->query("DELETE FROM users4 WHERE id = $newUserId");
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Deposit address not generated"
    ]);
    $conn->close();
    exit;
}

// 10) All good — return success
http_response_code(201);
echo json_encode([
    "status"  => "success",
    "message" => "Registration successful. Deposit address generated.",
    "user_id" => $newUserId
]);

$conn->close();
