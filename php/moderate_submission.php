<?php
// php/moderate_submission.php

// 1) CORS and JSON headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2) Session handling
require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

// 3) Load JSON request body
$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['submission_id'], $input['action'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing submission_id or action"]);
    exit;
}

require_once __DIR__ . "/config_login.php";
try {
    $pdo = new PDO(
        "mysql:host=$servername;dbname=$database;charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Connection failed"]);
    exit;
}

$submissionId = intval($input['submission_id']);
$action       = $input['action'];
$banUser      = false;
if (isset($input['ban']) && $input['ban'] === true) {
    $banUser = true;
}

// 4) Retrieve the user_id to ban and whop_id from the submission
$stmtInfo = $pdo->prepare("
    SELECT s.user_id AS ban_user_id, c.whop_id
    FROM submissions s
    JOIN campaign c ON s.campaign_id = c.id
    WHERE s.id = :sid
    LIMIT 1
");
$stmtInfo->execute(['sid' => $submissionId]);
$info = $stmtInfo->fetch(PDO::FETCH_ASSOC);
if (!$info) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Submission not found"]);
    exit;
}

$banUserId = intval($info['ban_user_id']);
$whopId    = intval($info['whop_id']);

// 5) In a transaction, perform reject/approve, optional ban, and bulk reject
try {
    $pdo->beginTransaction();

    if ($action === 'reject') {
        // a) Reject the submission
        if (!isset($input['reason']) || !strlen(trim($input['reason']))) {
            throw new Exception("Missing reason");
        }
        $reason = trim($input['reason']);
        $pdo->prepare("
            UPDATE submissions
            SET status = 'rejected',
                rejection_reason = :reason,
                updated_at = UTC_TIMESTAMP()
            WHERE id = :sid
        ")->execute(['reason' => $reason, 'sid' => $submissionId]);
    }
    elseif ($action === 'approve') {
        // b) Approve the submission
        $pdo->prepare("
            UPDATE submissions
            SET status = 'approved',
                updated_at = UTC_TIMESTAMP()
            WHERE id = :sid
        ")->execute(['sid' => $submissionId]);
    }
    else {
        throw new Exception("Invalid action");
    }

    if ($banUser) {
        // c) Add entry to whop_bans
        $pdo->prepare("
            INSERT INTO whop_bans (user_id, whop_id, banned_at)
            VALUES (:uid, :wid, UTC_TIMESTAMP())
            ON DUPLICATE KEY UPDATE banned_at = UTC_TIMESTAMP()
        ")->execute(['uid' => $banUserId, 'wid' => $whopId]);

        // d) Remove memberships
        $pdo->prepare("
            DELETE FROM memberships
            WHERE user_id = :uid
              AND whop_id = :wid
        ")->execute(['uid' => $banUserId, 'wid' => $whopId]);

        $pdo->prepare("
            DELETE FROM whop_members
            WHERE user_id = :uid
              AND whop_id = :wid
        ")->execute(['uid' => $banUserId, 'wid' => $whopId]);

        // e) Bulk reject all submissions from this user for the given whop
        $pdo->prepare("
            UPDATE submissions s
            JOIN campaign c ON s.campaign_id = c.id
            SET s.status = 'rejected',
                s.rejection_reason = 'User Banned',
                s.updated_at = UTC_TIMESTAMP()
            WHERE s.user_id = :uid
              AND c.whop_id = :wid
        ")->execute(['uid' => $banUserId, 'wid' => $whopId]);
    }

    $pdo->commit();
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
