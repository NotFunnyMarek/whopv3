<?php
// php/update_affiliate_link.php

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

$data = json_decode(file_get_contents('php://input'), true);
$link_id = isset($data['link_id']) ? (int)$data['link_id'] : 0;
$payout = isset($data['payout_percent']) ? floatval($data['payout_percent']) : null;
$delete = isset($data['delete']) ? boolval($data['delete']) : false;
if ($link_id <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing link_id"]);
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

    // verify owner of the whop for this link
    $chk = $pdo->prepare(
        "SELECT w.owner_id FROM affiliate_links al JOIN whops w ON al.whop_id = w.id WHERE al.id=:id"
    );
    $chk->execute(['id' => $link_id]);
    $row = $chk->fetch(PDO::FETCH_ASSOC);
    if (!$row || intval($row['owner_id']) !== $user_id) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"]);
        exit;
    }

    if ($delete) {
        $del = $pdo->prepare("DELETE FROM affiliate_links WHERE id=:id");
        $del->execute(['id' => $link_id]);
    } else {
        $upd = $pdo->prepare("UPDATE affiliate_links SET payout_percent=:p WHERE id=:id");
        $upd->execute(['p' => $payout, 'id' => $link_id]);
    }

    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
