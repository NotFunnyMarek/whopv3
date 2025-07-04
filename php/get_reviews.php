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

require_once __DIR__ . '/session_init.php';
$current_user = $_SESSION['user_id'] ?? 0;
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
        "SELECT r.id, r.user_id, r.text, r.rating, r.purchase_date, r.created_at, u.username, u.avatar_url
         FROM whop_reviews r
         JOIN users4 u ON r.user_id = u.id
         WHERE r.whop_id = :wid
         ORDER BY r.created_at DESC"
    );
    $stmt->execute(['wid' => $whop_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $reviews = array_map(function($r) use ($current_user){
        return [
            'id'          => (int)$r['id'],
            'username'    => $r['username'],
            'avatar_url'  => $r['avatar_url'],
            'text'        => $r['text'],
            'rating'      => (int)$r['rating'],
            'purchase_at' => $r['purchase_date'],
            'is_mine'     => ((int)$r['user_id'] === (int)$current_user) ? 1 : 0
        ];
    }, $rows);
    echo json_encode(["status" => "success", "data" => $reviews]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "DB error: " . $e->getMessage()]);
}
