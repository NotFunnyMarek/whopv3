<?php
// php/get_affiliate_links.php
// GET parameter: whop_id

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

$whop_id = isset($_GET['whop_id']) ? (int)$_GET['whop_id'] : 0;
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

    // verify owner
    $own = $pdo->prepare("SELECT 1 FROM whops WHERE id=:wid AND owner_id=:uid LIMIT 1");
    $own->execute(['wid' => $whop_id, 'uid' => $user_id]);
    if (!$own->fetch()) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"]);
        exit;
    }

    $stmt = $pdo->prepare(
        "SELECT 
            al.id,
            al.user_id,
            u.username,
            al.code,
            al.payout_percent,
            al.payout_recurring,
            al.clicks,
            al.signups,
            COALESCE(SUM(p.amount), 0) AS earned
         FROM affiliate_links al
         JOIN users4 u ON al.user_id = u.id
         LEFT JOIN payments p
           ON p.user_id = al.user_id
          AND p.whop_id = al.whop_id
          AND p.type = 'payout'
         WHERE al.whop_id = :wid
         GROUP BY al.id, al.user_id, u.username, al.code, al.payout_percent, al.payout_recurring, al.clicks, al.signups
         ORDER BY al.id DESC"
    );
    $stmt->execute(['wid' => $whop_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "data" => $rows]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
