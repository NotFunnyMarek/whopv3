<?php
// php/delete_review.php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? 0;
if ($user_id <= 0) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$review_id = isset($input['review_id']) ? intval($input['review_id']) : 0;
if ($review_id <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid review id"]);
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
    $stmt = $pdo->prepare("DELETE FROM whop_reviews WHERE id = :rid AND user_id = :uid");
    $stmt->execute(['rid' => $review_id, 'uid' => $user_id]);
    if ($stmt->rowCount() === 0) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Review not found"]);
        exit;
    }
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "DB error: " . $e->getMessage()]);
}
