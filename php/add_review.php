<?php
// php/add_review.php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$whop_id = isset($input['whop_id']) ? intval($input['whop_id']) : 0;
$name    = trim($input['name'] ?? '');
$text    = trim($input['text'] ?? '');
$rating  = isset($input['rating']) ? intval($input['rating']) : 0;
if ($whop_id <= 0 || $name === '' || $text === '' || $rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid input"]);
    exit;
}

require_once __DIR__ . '/config_login.php';
try {
    $pdo = new PDO(
        "mysql:host={$servername};dbname={$database};charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $stmt = $pdo->prepare(
        "INSERT INTO whop_reviews (whop_id, reviewer_name, text, rating)
         VALUES (:wid, :name, :txt, :rat)"
    );
    $stmt->execute([
        'wid' => $whop_id,
        'name' => $name,
        'txt' => $text,
        'rat' => $rating
    ]);
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "DB error: " . $e->getMessage()]);
}
