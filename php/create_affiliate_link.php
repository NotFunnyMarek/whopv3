<?php
// php/create_affiliate_link.php

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
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$whop_id = isset($input['whop_id']) ? (int)$input['whop_id'] : 0;
if ($whop_id <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing whop_id"]);
    exit;
}

require_once __DIR__ . '/config_login.php';
try {
    $pdo = new PDO(
        "mysql:host=$servername;dbname=$database;charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $mem = $pdo->prepare("SELECT 1 FROM whop_members WHERE user_id=:uid AND whop_id=:wid LIMIT 1");
    $mem->execute(['uid' => $user_id, 'wid' => $whop_id]);
    if (!$mem->fetch()) {
        $mem2 = $pdo->prepare("SELECT 1 FROM memberships WHERE user_id=:uid AND whop_id=:wid LIMIT 1");
        $mem2->execute(['uid' => $user_id, 'wid' => $whop_id]);
        if (!$mem2->fetch()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Not a member"]);
            exit;
        }
    }

    $sel = $pdo->prepare("SELECT id, code, payout_percent, payout_recurring, clicks, signups FROM affiliate_links WHERE user_id=:uid AND whop_id=:wid LIMIT 1");
    $sel->execute(['uid' => $user_id, 'wid' => $whop_id]);
    $row = $sel->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $code = $row['code'];
        $payout = (float)$row['payout_percent'];
        $recurring = (int)$row['payout_recurring'];
        $clicks = (int)$row['clicks'];
        $signups = (int)$row['signups'];
    } else {
        $code = bin2hex(random_bytes(8));
        $def = $pdo->prepare("SELECT affiliate_default_percent, affiliate_recurring FROM whops WHERE id=:wid LIMIT 1");
        $def->execute(['wid' => $whop_id]);
        $drow = $def->fetch(PDO::FETCH_ASSOC);
        $payout = $drow ? (float)$drow['affiliate_default_percent'] : 30.0;
        $recurring = $drow ? (int)$drow['affiliate_recurring'] : 0;
        $clicks = 0;
        $signups = 0;
        $ins = $pdo->prepare("INSERT INTO affiliate_links (user_id, whop_id, code, payout_percent, payout_recurring) VALUES (:uid, :wid, :code, :payout, :rec)");
        $ins->execute(['uid' => $user_id, 'wid' => $whop_id, 'code' => $code, 'payout' => $payout, 'rec' => $recurring]);
    }
    echo json_encode([
        "status" => "success",
        "code" => $code,
        "payout_percent" => $payout,
        "payout_recurring" => $recurring,
        "clicks" => $clicks,
        "signups" => $signups
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
