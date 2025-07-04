<?php
// php/get_memberships.php

// —————————————————————————————
// 1) CORS & headers
// —————————————————————————————
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Preflight CORS request
    http_response_code(200);
    exit;
}

// —————————————————————————————
// 2) Session & authentication check
// —————————————————————————————
require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "Unauthorized"
    ]);
    exit;
}

// —————————————————————————————
// 3) Database connection
// —————————————————————————————
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
    echo json_encode([
        "status"  => "error",
        "message" => "Connection failed: " . $e->getMessage()
    ]);
    exit;
}

// —————————————————————————————
// 4) Fetch this user’s memberships
// —————————————————————————————
try {
    $sql = "
        SELECT
            m.id             AS membership_id,
            m.whop_id,
            w.slug,
            w.banner_url,
            m.price,
            m.currency,
            m.is_recurring,
            m.billing_period,
            m.start_at,
            m.next_payment_at,
            m.status
        FROM memberships AS m
        JOIN whops        AS w ON m.whop_id = w.id
        WHERE m.user_id = :user_id
        ORDER BY m.start_at DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => $user_id]);
    $memberships = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data"   => $memberships
    ]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "SQL Error: " . $e->getMessage()
    ]);
    exit;
}
