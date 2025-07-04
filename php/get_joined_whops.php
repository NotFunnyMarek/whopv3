<?php
// php/get_joined_whops.php

// ---------------------------------------------------
// 1) CORS & headers
// ---------------------------------------------------
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

// ---------------------------------------------------
// 2) Session & authentication check
// ---------------------------------------------------
require_once __DIR__ . '/session_init.php';
$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "Unauthorized"
    ]);
    exit;
}

// ---------------------------------------------------
// 3) Database connection
// ---------------------------------------------------
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

// ---------------------------------------------------
// 4) Fetch all Whops this user has joined, either free or paid
// ---------------------------------------------------
try {
    $sql = "
        ( SELECT
            w.id,
            w.slug,
            w.banner_url
          FROM whop_members AS wm
          JOIN whops        AS w ON wm.whop_id = w.id
          WHERE wm.user_id = :user_id
        )
        UNION
        ( SELECT
            w2.id,
            w2.slug,
            w2.banner_url
          FROM memberships AS m
          JOIN whops        AS w2 ON m.whop_id = w2.id
          WHERE m.user_id = :user_id
            AND m.status = 'active'
        )
        ORDER BY id DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => $userId]);
    $joinedWhops = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data"   => $joinedWhops
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
