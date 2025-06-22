<?php
// php/get_user_whops.php

// =========================================
// CORS & headers
// =========================================
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =========================================
// Session
// =========================================
session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized – you are not logged in"]);
    exit;
}

// =========================================
// Database connection
// =========================================
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

// =========================================
// Return JSON list of Whops where owner_id = logged-in user
// =========================================
try {
    $sql = "
        SELECT
          w.id,
          w.name,
          w.slug,
          w.description,
          w.logo_url,
          w.banner_url,
          w.created_at
        FROM whops AS w
        WHERE w.owner_id = :owner_id
        ORDER BY w.created_at DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['owner_id' => $user_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "data" => $rows]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "SQL Error: " . $e->getMessage()]);
    exit;
}
