<?php
// php/get_reviews.php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config_login.php';

$whop_id = isset($_GET['whop_id']) ? intval($_GET['whop_id']) : 0;
if ($whop_id <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing whop_id"]);
    exit;
}

try {
    $pdo = new PDO(
        "mysql:host={$servername};dbname={$database};charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $stmt = $pdo->prepare(
        "SELECT id, reviewer_name, text, rating, created_at
         FROM whop_reviews WHERE whop_id = :wid
         ORDER BY created_at DESC"
    );
    $stmt->execute(['wid' => $whop_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $reviews = array_map(function($r){
        return [
            'id'    => (int)$r['id'],
            'name'  => $r['reviewer_name'],
            'text'  => $r['text'],
            'rating'=> (int)$r['rating'],
            'date'  => $r['created_at']
        ];
    }, $rows);
    echo json_encode(["status" => "success", "data" => $reviews]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "DB error: " . $e->getMessage()]);
}
