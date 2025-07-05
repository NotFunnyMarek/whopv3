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


require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? 0;
if ($user_id <= 0) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$whop_id = isset($input['whop_id']) ? intval($input['whop_id']) : 0;
$text    = trim($input['text'] ?? '');
$rating  = isset($input['rating']) ? intval($input['rating']) : 0;
if ($whop_id <= 0 || $text === '' || $rating < 1 || $rating > 5) {
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

    // Determine earliest purchase date
    $stmt = $pdo->prepare("SELECT start_at FROM memberships WHERE user_id = :uid AND whop_id = :wid ORDER BY start_at ASC LIMIT 1");
    $stmt->execute(['uid' => $user_id, 'wid' => $whop_id]);
    $purchase = $stmt->fetchColumn();
    if (!$purchase) {
        $st2 = $pdo->prepare("SELECT joined_at FROM whop_members WHERE user_id = :uid AND whop_id = :wid ORDER BY joined_at ASC LIMIT 1");
        $st2->execute(['uid' => $user_id, 'wid' => $whop_id]);
        $purchase = $st2->fetchColumn();
    }
    if (!$purchase) {
        $st3 = $pdo->prepare("SELECT payment_date FROM payments WHERE user_id = :uid AND whop_id = :wid ORDER BY payment_date ASC LIMIT 1");
        $st3->execute(['uid' => $user_id, 'wid' => $whop_id]);
        $purchase = $st3->fetchColumn();
    }
    if (!$purchase) {
        $st4 = $pdo->prepare("SELECT joined_at FROM whop_member_history WHERE user_id = :uid AND whop_id = :wid ORDER BY joined_at ASC LIMIT 1");
        $st4->execute(['uid' => $user_id, 'wid' => $whop_id]);
        $purchase = $st4->fetchColumn();
    }
    if (!$purchase) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "You must be a member to review."]);
        exit;
    }

    $chk = $pdo->prepare("SELECT id FROM whop_reviews WHERE whop_id = :wid AND user_id = :uid");
    $chk->execute(['wid' => $whop_id, 'uid' => $user_id]);
    if ($chk->fetch()) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Review already exists"]);
        exit;
    }

    $ins = $pdo->prepare("INSERT INTO whop_reviews (whop_id, user_id, text, rating, purchase_date) VALUES (:wid, :uid, :txt, :rat, :pdate)");
    $ins->execute([
        'wid'   => $whop_id,
        'uid'   => $user_id,
        'txt'   => $text,
        'rat'   => $rating,
        'pdate' => $purchase
    ]);
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "DB error: " . $e->getMessage()]);
}
