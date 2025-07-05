<?php
// php/save_course_progress.php

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
$steps   = isset($input['completed_steps']) && is_array($input['completed_steps'])
    ? array_values($input['completed_steps'])
    : null;
if ($whop_id <= 0 || $steps === null) {
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

    // verify membership
    $m1 = $pdo->prepare("SELECT COUNT(*) FROM whop_members WHERE user_id = :uid AND whop_id = :wid");
    $m1->execute(['uid' => $user_id, 'wid' => $whop_id]);
    $is_member = $m1->fetchColumn() > 0;

    $m2 = $pdo->prepare("SELECT COUNT(*) FROM memberships WHERE user_id = :uid AND whop_id = :wid AND status = 'active'");
    $m2->execute(['uid' => $user_id, 'wid' => $whop_id]);
    $is_member = $is_member || ($m2->fetchColumn() > 0);

    if (!$is_member) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Not a member"]);
        exit;
    }

    $json = json_encode($steps, JSON_UNESCAPED_UNICODE);
    $stmt = $pdo->prepare(
        "INSERT INTO whop_course_progress (user_id, whop_id, completed_steps) VALUES (:uid, :wid, :steps)
         ON DUPLICATE KEY UPDATE completed_steps = VALUES(completed_steps), updated_at = CURRENT_TIMESTAMP"
    );
    $stmt->execute(['uid' => $user_id, 'wid' => $whop_id, 'steps' => $json]);

    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "DB error: " . $e->getMessage()]);
}
