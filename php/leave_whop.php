<?php
// php/leave_whop.php

// 1) CORS & headers
$allowed_origins = [
    "http://localhost:3000",
    "https://app.byxbot.com"
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? "";
if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2) Session & authorization
session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

// 3) Read JSON body
$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['whop_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing whop_id"]);
    exit;
}
$whop_id = intval($input['whop_id']);

// 4) Database connection
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

// 5) Transactionally mark submissions as 'rejected'
try {
    $pdo->beginTransaction();

    $updateSubs = $pdo->prepare("
        UPDATE submissions AS s
        JOIN campaign AS c ON s.campaign_id = c.id
        SET
            s.status = 'rejected',
            s.rejection_reason = 'User left',
            s.updated_at = UTC_TIMESTAMP()
        WHERE s.user_id = :user_id
          AND c.whop_id = :whop_id
          AND c.is_active = 1
    ");
    $updateSubs->execute([
        'user_id' => $user_id,
        'whop_id' => $whop_id
    ]);

    // 6) Check if the user has an active paid membership
    $stmt = $pdo->prepare("
        SELECT id
        FROM memberships
        WHERE user_id = :user_id
          AND whop_id = :whop_id
          AND status = 'active'
        LIMIT 1
    ");
    $stmt->execute(['user_id' => $user_id, 'whop_id' => $whop_id]);
    $membership = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($membership) {
        // a) Paid → cancel membership
        $upd = $pdo->prepare("
            UPDATE memberships
            SET status = 'canceled', next_payment_at = NULL
            WHERE id = :membership_id
        ");
        $upd->execute(['membership_id' => (int)$membership['id']]);
        $message = "Subscription canceled and access revoked.";
    } else {
        // b) Free → remove from whop_members
        $del = $pdo->prepare("
            DELETE FROM whop_members
            WHERE user_id = :user_id AND whop_id = :whop_id
        ");
        $del->execute(['user_id' => $user_id, 'whop_id' => $whop_id]);
        $message = "You have left the Whop.";
    }

    $pdo->commit();
    echo json_encode(["status" => "success", "message" => $message]);
    exit;

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    error_log("leave_whop error: " . $e->getMessage());
    echo json_encode(["status" => "error", "message" => "SQL Error: " . $e->getMessage()]);
    exit;
}
