<?php
// php/cancel_auto_renew.php

// ——————————————————————————————————————————————
// 1) CORS & headers
// ——————————————————————————————————————————————
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ——————————————————————————————————————————————
// 2) Read JSON body
// ——————————————————————————————————————————————
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Invalid JSON"
    ]);
    exit;
}

// Expecting: membership_id and whop_id
if (!isset($input['membership_id'], $input['whop_id'])) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Missing 'membership_id' or 'whop_id'"
    ]);
    exit;
}

$membership_id = intval($input['membership_id']);
$whop_id       = intval($input['whop_id']);

// ——————————————————————————————————————————————
// 3) Database connection
// ——————————————————————————————————————————————
require_once __DIR__ . '/config_login.php';

try {
    $pdo = new PDO(
        "mysql:host={$servername};dbname={$database};charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Connection failed: " . $e->getMessage()
    ]);
    exit;
}

// ——————————————————————————————————————————————
// 4) Verify membership exists, is active, and is recurring
// ——————————————————————————————————————————————
try {
    $stmt = $pdo->prepare("
        SELECT id, status, is_recurring, next_payment_at
        FROM memberships
        WHERE id = :membership_id
          AND whop_id = :whop_id
        LIMIT 1
    ");
    $stmt->execute([
        'membership_id' => $membership_id,
        'whop_id'       => $whop_id
    ]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode([
            "status"  => "error",
            "message" => "Membership not found"
        ]);
        exit;
    }
    if ($row['status'] !== 'active') {
        http_response_code(400);
        echo json_encode([
            "status"  => "error",
            "message" => "Membership is not active"
        ]);
        exit;
    }
    if (intval($row['is_recurring']) !== 1) {
        http_response_code(400);
        echo json_encode([
            "status"  => "error",
            "message" => "Membership is not recurring"
        ]);
        exit;
    }

    $nextPayment = $row['next_payment_at'];
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error finding membership: " . $e->getMessage()
    ]);
    exit;
}

// ——————————————————————————————————————————————
// 5) Disable auto-renewal (set is_recurring = 0), leave status 'active'
// ——————————————————————————————————————————————
try {
    $upd = $pdo->prepare("
        UPDATE memberships
        SET is_recurring = 0
        WHERE id = :membership_id
    ");
    $upd->execute(['membership_id' => $membership_id]);

    echo json_encode([
        "status"  => "success",
        "message" => "Auto-renewal canceled. Access remains active until: $nextPayment"
    ]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error canceling auto-renewal: " . $e->getMessage()
    ]);
    exit;
}
