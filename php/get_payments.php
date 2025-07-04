<?php
// php/get_payments.php

// 1) CORS & headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2) Session & authentication
require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

// 3) Database connection
require_once __DIR__ . '/config_login.php';

try {
    $pdo = new PDO(
        "mysql:host=$servername;dbname=$database;charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]);
    exit;
}

// 4) Fetch payment records and total spent
try {
    // List of payments with Whop name
    $sql = "
        SELECT 
          p.id,
          p.whop_id,
          w.name AS whop_name,
          p.amount,
          p.currency,
          p.payment_date,
          p.type
        FROM payments AS p
        JOIN whops    AS w ON p.whop_id = w.id
        WHERE p.user_id = :user_id
        ORDER BY p.payment_date DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => $user_id]);
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Sum of all payments
    $sumStmt = $pdo->prepare("
        SELECT SUM(amount) AS total_spent 
        FROM payments 
        WHERE user_id = :user_id
    ");
    $sumStmt->execute(['user_id' => $user_id]);
    $sumRow = $sumStmt->fetch(PDO::FETCH_ASSOC);
    $total_spent = $sumRow['total_spent'] !== null ? floatval($sumRow['total_spent']) : 0.00;

    echo json_encode([
        "status" => "success",
        "data"   => [
            "payments"     => $payments,
            "total_spent"  => $total_spent
        ]
    ]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "SQL Error: " . $e->getMessage()]);
    exit;
}
?>
