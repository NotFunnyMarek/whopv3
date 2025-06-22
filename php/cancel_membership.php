<?php
// php/cancel_membership.php

// 1) CORS & headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 2) Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 3) Session & authorization
session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "Unauthorized – user not logged in"
    ]);
    exit;
}

// 4) Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['whop_id'])) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Missing 'whop_id' parameter"
    ]);
    exit;
}
$whop_id = intval($input['whop_id']);

// 5) Database connection
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

// 6) Reject any pending submissions for this user in this Whop
try {
    $rejectSubs = $pdo->prepare("
        UPDATE submissions AS s
        JOIN campaign AS c ON s.campaign_id = c.id
        SET s.status = 'rejected',
            s.rejection_reason = 'User Left',
            s.updated_at = UTC_TIMESTAMP()
        WHERE s.user_id = :user_id
          AND c.whop_id = :whop_id
          AND c.is_active = 1
    ");
    $rejectSubs->execute([
        'user_id' => $user_id,
        'whop_id' => $whop_id
    ]);
} catch (PDOException $e) {
    error_log("cancel_membership: failed to reject submissions: " . $e->getMessage());
    // Continue even if this fails
}

// 7) Check for an active paid membership
try {
    $findMembership = $pdo->prepare("
        SELECT id
        FROM memberships
        WHERE user_id = :user_id
          AND whop_id = :whop_id
          AND status = 'active'
        LIMIT 1
    ");
    $findMembership->execute([
        'user_id' => $user_id,
        'whop_id' => $whop_id
    ]);
    $membership = $findMembership->fetch(PDO::FETCH_ASSOC);

    if ($membership) {
        // 7a) Cancel the paid membership and remove free membership link
        $pdo->beginTransaction();

        $cancelPaid = $pdo->prepare("
            UPDATE memberships
            SET status = 'canceled', next_payment_at = NULL
            WHERE id = :mid
        ");
        $cancelPaid->execute(['mid' => (int)$membership['id']]);

        $removeFree = $pdo->prepare("
            DELETE FROM whop_members
            WHERE user_id = :user_id
              AND whop_id = :whop_id
        ");
        $removeFree->execute([
            'user_id' => $user_id,
            'whop_id' => $whop_id
        ]);

        $pdo->commit();

        echo json_encode([
            "status"  => "success",
            "message" => "Paid membership canceled and access revoked."
        ]);
        exit;
    }

    // 7b) No paid membership: remove from free members
    $removeFree = $pdo->prepare("
        DELETE FROM whop_members
        WHERE user_id = :user_id
          AND whop_id = :whop_id
    ");
    $removeFree->execute([
        'user_id' => $user_id,
        'whop_id' => $whop_id
    ]);

    echo json_encode([
        "status"  => "success",
        "message" => "You have left the Whop."
    ]);
    exit;

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error canceling membership: " . $e->getMessage()
    ]);
    exit;
}
