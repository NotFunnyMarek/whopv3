<?php
// php/remove_member.php

// ——————————————————————————————————————————————————————————————
// 1) CORS & headers
// ——————————————————————————————————————————————————————————————
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ——————————————————————————————————————————————————————————————
// 2) Session and user authentication
// ——————————————————————————————————————————————————————————————
session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "Unauthorized – you are not logged in"
    ]);
    exit;
}

// ——————————————————————————————————————————————————————————————
// 3) Read JSON input
// ——————————————————————————————————————————————————————————————
$input = json_decode(file_get_contents('php://input'), true);
if (
    !$input ||
    !isset($input['remove_user_id']) ||
    !isset($input['whop_id'])
) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Missing remove_user_id or whop_id"
    ]);
    exit;
}
$removeUserId = intval($input['remove_user_id']);
$whopId       = intval($input['whop_id']);

// ——————————————————————————————————————————————————————————————
// 4) Connect to the database
// ——————————————————————————————————————————————————————————————
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
    echo json_encode([
        "status"  => "error",
        "message" => "Connection failed: " . $e->getMessage()
    ]);
    exit;
}

// ——————————————————————————————————————————————————————————————
// 5) Mark all of that user's submissions as rejected
// ——————————————————————————————————————————————————————————————
try {
    $updateSubs = $pdo->prepare("
        UPDATE submissions AS s
        JOIN campaign AS c ON s.campaign_id = c.id
           SET s.status = 'rejected',
               s.rejection_reason = 'User Removed',
               s.updated_at = UTC_TIMESTAMP()
         WHERE s.user_id = :remove_user_id
           AND c.whop_id = :whop_id
           AND c.is_active = 1
    ");
    $updateSubs->execute([
        'remove_user_id' => $removeUserId,
        'whop_id'        => $whopId
    ]);
} catch (PDOException $e) {
    error_log("Error marking submissions in remove_member: " . $e->getMessage());
    // Continue even if marking submissions fails
}

// ——————————————————————————————————————————————————————————————
// 6) Remove the member (both paid and free) if present
// ——————————————————————————————————————————————————————————————
try {
    // a) Remove from memberships table (paid member)
    $stmtPaid = $pdo->prepare("
        DELETE FROM memberships
         WHERE user_id = :remove_user_id
           AND whop_id = :whop_id
    ");
    $stmtPaid->execute([
        'remove_user_id' => $removeUserId,
        'whop_id'        => $whopId
    ]);

    // b) Remove from whop_members table (free member)
    $stmtFree = $pdo->prepare("
        DELETE FROM whop_members
         WHERE user_id = :remove_user_id
           AND whop_id = :whop_id
    ");
    $stmtFree->execute([
        'remove_user_id' => $removeUserId,
        'whop_id'        => $whopId
    ]);

    echo json_encode([
        "status"  => "success",
        "message" => "Member removed and their submissions marked as rejected."
    ]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error removing member: " . $e->getMessage()
    ]);
    exit;
}
