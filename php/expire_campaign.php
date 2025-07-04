<?php
// php/expire_campaign.php

// 1) CORS & headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized – you are not logged in"]);
    exit;
}

// --- Database connection ---
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
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['campaign_id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing campaign_id"]);
    exit;
}
$campaignId = intval($input['campaign_id']);

try {
    // 1) Find which Whop this campaign belongs to, and verify the user is the owner
    $sql = "
        SELECT c.whop_id, w.owner_id
        FROM campaign AS c
        JOIN whops    AS w ON c.whop_id = w.id
        WHERE c.id = :campaignId
        LIMIT 1
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['campaignId' => $campaignId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(["error" => "Campaign not found"]);
        exit;
    }
    if ((int)$row['owner_id'] !== $user_id) {
        http_response_code(403);
        echo json_encode(["error" => "You do not have permission to expire this campaign"]);
        exit;
    }

    // 2) Deactivate campaign, reject submissions, and refund remaining budget
    $pdo->beginTransaction();

    // 2a) Deactivate the campaign
    $update = $pdo->prepare("
        UPDATE campaign
        SET is_active = 0
        WHERE id = :campaignId
    ");
    $update->execute(['campaignId' => $campaignId]);

    // 2b) Mark all pending or approved submissions as rejected
    $reject = $pdo->prepare("
        UPDATE submissions
        SET status = 'rejected',
            rejection_reason = 'Campaign Expired'
        WHERE campaign_id = :campaignId
          AND (status = 'pending' OR status = 'approved')
    ");
    $reject->execute(['campaignId' => $campaignId]);

    // 2c) Refund the remaining budget (budget - paid_out) back to the owner
    $refundStmt = $pdo->prepare("
        SELECT budget, paid_out
        FROM campaign
        WHERE id = :campaignId
        LIMIT 1
    ");
    $refundStmt->execute(['campaignId' => $campaignId]);
    $campRow = $refundStmt->fetch(PDO::FETCH_ASSOC);
    if ($campRow) {
        $budget    = floatval($campRow['budget']);
        $paidOut   = floatval($campRow['paid_out']);
        $refundAmt = $budget - $paidOut;
        if ($refundAmt > 0) {
            $pdo->prepare("
                UPDATE users4
                SET balance = balance + :refundAmt
                WHERE id = :ownerId
            ")->execute([
                'refundAmt' => $refundAmt,
                'ownerId'   => $user_id
            ]);
        }
    }

    $pdo->commit();
    echo json_encode(["success" => true]);
    exit;
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "SQL Error: " . $e->getMessage()]);
    exit;
}
