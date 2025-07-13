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
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Not a member"]);
        exit;
    }

    $sel = $pdo->prepare("SELECT id, code, payout_percent, clicks, signups FROM affiliate_links WHERE user_id=:uid AND whop_id=:wid LIMIT 1");

    $sel->execute(['uid' => $user_id, 'wid' => $whop_id]);
    $row = $sel->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $code = $row['code'];
        $payout = (float)$row['payout_percent'];
        $clicks = (int)$row['clicks'];
        $signups = (int)$row['signups'];
    } else {
        $code = bin2hex(random_bytes(8));
        $payout = 30.0;
        $clicks = 0;
        $signups = 0;
        $ins = $pdo->prepare("INSERT INTO affiliate_links (user_id, whop_id, code) VALUES (:uid, :wid, :code)");
        $ins->execute(['uid' => $user_id, 'wid' => $whop_id, 'code' => $code]);
    }
    echo json_encode([
        "status" => "success",
        "code" => $code,
        "payout_percent" => $payout,
        "clicks" => $clicks,
        "signups" => $signups
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
