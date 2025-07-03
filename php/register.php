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

session_start(); // If you use sessions for anything

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

// 5) Check uniqueness of username and email
$sqlCheck = "
  SELECT id 
    FROM users4 
   WHERE username = '$username' 
      OR email    = '$email'
   LIMIT 1
";
$resCheck = $conn->query($sqlCheck);
if ($resCheck && $resCheck->num_rows > 0) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "A user with that username or email already exists"
    ]);
    $conn->close();
    exit;
}

// 6) Insert the new user (we leave `name` NULL)
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$insertSql = "
  INSERT INTO users4
    (username, email, password_hash, balance)
  VALUES
    ('$username', '$email', '$hashedPassword', 0.00000000)
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

// 7) Get the new user's ID
$newUserId = $conn->insert_id;

// 8) Run `setup_deposit_addresses.js` for this user
//    Adjust the paths to Node and to your script as needed
$nodePath   = '/usr/bin/node';         // Adjust to your Node.js path
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

// 9) All good — return success
http_response_code(201);
echo json_encode([
    "status"  => "success",
    "message" => "Registration successful. Deposit address generated.",
    "user_id" => $newUserId
]);

$conn->close();
