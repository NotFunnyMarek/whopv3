<?php
// File: php/deposit.php

// 1) CORS and HTTP headers for React (localhost:3000)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 2) Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 3) SESSION – authentication check
require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode([
      "status"  => "error",
      "message" => "User is not logged in"
    ]);
    exit;
}

// 4) Database connection
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

// 5) GET: return deposit_address and balance
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id_int = intval($user_id);
    $sql = "
      SELECT deposit_address, balance
      FROM users4
      WHERE id = $user_id_int
      LIMIT 1
    ";
    $res = $conn->query($sql);
    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        // If deposit_address is NULL or empty, return empty string
        $deposit_address = $row["deposit_address"] ?: '';
        $balance = number_format(floatval($row["balance"]), 8, '.', '');
        echo json_encode([
            "status" => "success",
            "data"   => [
                "deposit_address" => $deposit_address,
                "balance"         => $balance
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
          "status"  => "error",
          "message" => "User not found"
        ]);
    }
    $conn->close();
    exit;
}

// 6) Other methods are not allowed
http_response_code(405);
echo json_encode([
  "status"  => "error",
  "message" => "Method not allowed"
]);
exit;
