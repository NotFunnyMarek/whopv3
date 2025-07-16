<?php
// php/update_affiliate_defaults.php
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
$whop_id = isset($data['whop_id']) ? (int)$data['whop_id'] : 0;
$percent = isset($data['affiliate_default_percent']) ? floatval($data['affiliate_default_percent']) : null;
if ($percent !== null) {
    if ($percent < 0) $percent = 0.0;
    if ($percent > 100) $percent = 100.0;
}
$recurring = isset($data['affiliate_recurring']) ? intval($data['affiliate_recurring']) : 0;
if ($whop_id <= 0 || $percent === null) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing parameters"]);
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
    $chk = $pdo->prepare("SELECT owner_id FROM whops WHERE id=:id LIMIT 1");
    $chk->execute(['id' => $whop_id]);
    $row = $chk->fetch(PDO::FETCH_ASSOC);
    if (!$row || (int)$row['owner_id'] !== $user_id) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"]);
        exit;
    }
    $upd = $pdo->prepare("UPDATE whops SET affiliate_default_percent=:p, affiliate_recurring=:r WHERE id=:id");
    $upd->execute(['p' => $percent, 'r' => $recurring, 'id' => $whop_id]);
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
