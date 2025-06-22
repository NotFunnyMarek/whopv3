<?php
// php/updateDeposit.php

// 1) CORS & headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 2) Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 3) Read and decode JSON body
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Invalid JSON body"
    ]);
    exit;
}

// 4) Validate required fields
$required = ['tx_signature', 'user_id', 'sol_amount', 'usd_amount'];
foreach ($required as $field) {
    if (!isset($data[$field])) {
        http_response_code(400);
        echo json_encode([
            "status"  => "error",
            "message" => "Missing field '$field'"
        ]);
        exit;
    }
}

$tx_signature = $data['tx_signature'];
$user_id       = intval($data['user_id']);
$sol_amount    = floatval($data['sol_amount']);
$usd_amount    = floatval($data['usd_amount']);

// 5) Database connection
require_once __DIR__ . '/config_login2.php';
$conn = new mysqli($servername, $db_username, $db_password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Cannot connect to DB"
    ]);
    exit;
}

// 6) Check if this deposit already exists
$stmtCheck = $conn->prepare("SELECT id FROM deposit_records WHERE tx_signature = ?");
$stmtCheck->bind_param("s", $tx_signature);
$stmtCheck->execute();
$resCheck = $stmtCheck->get_result();
if ($resCheck && $resCheck->num_rows > 0) {
    http_response_code(409);
    echo json_encode([
        "status"  => "error",
        "message" => "Deposit already exists"
    ]);
    $stmtCheck->close();
    $conn->close();
    exit;
}
$stmtCheck->close();

// 7) Insert new deposit record
$stmtInsert = $conn->prepare("
  INSERT INTO deposit_records (tx_signature, user_id, sol_amount, usd_amount, swept)
  VALUES (?, ?, ?, ?, false)
");
$stmtInsert->bind_param("sidd", $tx_signature, $user_id, $sol_amount, $usd_amount);
if (!$stmtInsert->execute()) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error inserting deposit record: " . $conn->error
    ]);
    $stmtInsert->close();
    $conn->close();
    exit;
}
$stmtInsert->close();

// 8) Update user's USD balance
$stmtUpdate = $conn->prepare("UPDATE users4 SET balance = balance + ? WHERE id = ?");
$stmtUpdate->bind_param("di", $usd_amount, $user_id);
if (!$stmtUpdate->execute()) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error updating balance: " . $conn->error
    ]);
    $stmtUpdate->close();
    $conn->close();
    exit;
}
$stmtUpdate->close();

// 9) Success response
$conn->close();
echo json_encode([
    "status"  => "success",
    "message" => "Deposit recorded"
]);
