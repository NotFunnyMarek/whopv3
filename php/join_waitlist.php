<?php
// php/join_waitlist.php

// CORS and JSON headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Session and authentication
require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);
$whop_id = $input['whop_id'] ?? null;
if (!$whop_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing whop_id"]);
    exit;
}

require_once __DIR__ . '/config_login.php';
$pdo = new PDO(
    "mysql:host={$servername};dbname={$database};charset=utf8mb4",
    $db_username,
    $db_password,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

// Verify that the Whop exists and waitlist is enabled
$stmt = $pdo->prepare("
    SELECT waitlist_enabled, waitlist_questions 
    FROM whops 
    WHERE id = :wid
");
$stmt->execute(['wid' => $whop_id]);
$wh = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$wh || !$wh['waitlist_enabled']) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Waitlist is not enabled"]);
    exit;
}

// Optionally collect answers from UI; for now, an empty array
$answers = [];

// Insert or update waitlist request
try {
    $ins = $pdo->prepare("
        INSERT INTO waitlist_requests (whop_id, user_id, answers_json)
        VALUES (:wid, :uid, :ans)
        ON DUPLICATE KEY UPDATE
            requested_at = NOW(),
            status = 'pending',
            handled_at = NULL,
            answers_json = :ans
    ");
    $ins->execute([
        'wid' => $whop_id,
        'uid' => $user_id,
        'ans' => json_encode($answers)
    ]);
    echo json_encode(["status" => "success", "message" => "Request sent"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error"]);
}
