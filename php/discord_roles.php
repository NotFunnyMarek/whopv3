<?php
// discord_roles.php - fetch guild roles for the owner's Discord server

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

$whopId = isset($_GET['whop_id']) ? intval($_GET['whop_id']) : 0;
if ($whopId <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing whop_id']);
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
    echo json_encode(['status' => 'error', 'message' => 'Database connection error']);
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

    $stmt = $pdo->prepare('SELECT guild_id FROM discord_servers WHERE whop_id = :wid LIMIT 1');
    $stmt->execute(['wid' => $whopId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $guildId = $row['guild_id'] ?? '';
    if (!$guildId) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Server not linked']);
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error']);
    exit;
}

$botToken = getenv('DISCORD_BOT_TOKEN') ?: '';
if (!$botToken) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Bot token missing']);
    exit;
}

$ch = curl_init("https://discord.com/api/guilds/$guildId/roles");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Authorization: Bot ' . $botToken]
]);
$resp = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http !== 200) {
    http_response_code($http);
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch roles']);
    exit;
}

$roles = json_decode($resp, true);
if (!is_array($roles)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Invalid response']);
    exit;
}

$out = array_map(function($r) {
    return [
        'id' => $r['id'],
        'name' => $r['name']
    ];
}, $roles);

echo json_encode(['status' => 'success', 'roles' => $out]);

