<?php
// File: php/search_whops.php

// =========================================
// Allowed origins (development and production)
// =========================================
$allowed_origins = [
    'http://localhost:3000',
    'https://app.byxbot.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/config_login.php";

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
        "message" => "Database connection failed"
    ]);
    exit;
}

$q = trim($_GET['q'] ?? '');
if ($q === '') {
    echo json_encode([
        "status" => "success",
        "data"   => []
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT name, slug, description, logo_url, banner_url
          FROM whops
         WHERE name LIKE :term
            OR slug LIKE :term
         ORDER BY created_at DESC
         LIMIT 10
    ");
    $stmt->execute(['term' => "%$q%"]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data"   => $items
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "SQL error"
    ]);
}
