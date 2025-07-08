<?php
// discord_link.php - manage linking of a Discord server

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
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
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection error"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    $whopId = isset($input['whop_id']) ? intval($input['whop_id']) : 0;
    if ($whopId <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing whop_id']);
        exit;
    }
    try {
        $chk = $pdo->prepare('SELECT owner_id FROM whops WHERE id = :wid');
        $chk->execute(['wid' => $whopId]);
        $row = $chk->fetch(PDO::FETCH_ASSOC);
        if (!$row || intval($row['owner_id']) !== intval($user_id)) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Insufficient permissions']);
            exit;
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
        exit;
    }
    if ($action === 'request_code') {
        $code = random_int(100000, 999999);
        $_SESSION['discord_setup_code'] = $code;
        echo json_encode(['status' => 'success', 'code' => $code]);
        exit;
    }
    if ($action === 'confirm') {
        $guildId = $input['guild_id'] ?? '';
        $code    = $input['code'] ?? '';
        if ($code != ($_SESSION['discord_setup_code'] ?? '')) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid code']);
            exit;
        }
        unset($_SESSION['discord_setup_code']);
        $stmt = $pdo->prepare('REPLACE INTO discord_servers (whop_id, guild_id, owner_discord_id) VALUES (:wid, :gid, :owner)');
        $stmt->execute([
            'wid'   => $whopId,
            'gid'   => $guildId,
            'owner' => $_SESSION['discord_id'] ?? ''
        ]);
        echo json_encode(['status' => 'success']);
        exit;
    }
    if ($action === 'unlink') {
        $stmt = $pdo->prepare('DELETE FROM discord_servers WHERE whop_id = :wid');
        $stmt->execute(['wid' => $whopId]);
        echo json_encode(['status' => 'success']);
        exit;
    }
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Unknown action']);
    exit;
}

if ($method === 'GET') {
    $whopId = isset($_GET['whop_id']) ? intval($_GET['whop_id']) : 0;
    if ($whopId <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing whop_id']);
        exit;
    }
    $stmt = $pdo->prepare('SELECT guild_id FROM discord_servers WHERE whop_id = :wid LIMIT 1');
    $stmt->execute(['wid' => $whopId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'data' => $row]);
    exit;
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
