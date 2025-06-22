<?php
// deposit_history.php

// 1) CORS & headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// 2) Session & authentication
session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

// 3) Database connection (MySQLi)
require_once __DIR__ . '/config_login.php';

$conn = new mysqli($servername, $db_username, $db_password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Cannot connect to DB"]);
    exit;
}

// 4) Fetch deposit history for the user
$user_id_int = intval($user_id);
$stmt = $conn->prepare("
    SELECT sol_amount, usd_amount, tx_signature, created_at
    FROM deposit_records
    WHERE user_id = ?
    ORDER BY created_at DESC
");
$stmt->bind_param("i", $user_id_int);
$stmt->execute();
$res = $stmt->get_result();

$data = [];
while ($row = $res->fetch_assoc()) {
    $data[] = [
        "sol_amount"   => floatval($row['sol_amount']),
        "usd_amount"   => floatval($row['usd_amount']),
        "tx_signature" => $row['tx_signature'],
        "created_at"   => $row['created_at']
    ];
}

echo json_encode(["status" => "success", "data" => $data]);
$conn->close();
exit;
