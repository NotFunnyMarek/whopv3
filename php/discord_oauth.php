<?php
// discord_oauth.php - handle Discord OAuth callback and join server

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$code = $input['code'] ?? '';
$redirect = $input['redirect_uri'] ?? '';
$whopId = isset($input['whop_id']) ? intval($input['whop_id']) : 0;
if (!$code || $whopId <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing code or whop_id"]);
    exit;
}
if (!$redirect) {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $redirect = $scheme . '://' . $_SERVER['HTTP_HOST'] . '/discord-access';
}

$clientId     = getenv('DISCORD_CLIENT_ID') ?: '1391881188901388348';
$clientSecret = getenv('DISCORD_CLIENT_SECRET') ?: '';
$botToken     = getenv('DISCORD_BOT_TOKEN') ?: '';
if (!$clientSecret || !$botToken) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Discord credentials not configured"]);
    exit;
}

$postData = http_build_query([
    'client_id' => $clientId,
    'client_secret' => $clientSecret,
    'grant_type' => 'authorization_code',
    'code' => $code,
    'redirect_uri' => $redirect,
]);

$ch = curl_init('https://discord.com/api/oauth2/token');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_POSTFIELDS => $postData,
]);
$resp = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
if ($http !== 200) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Token exchange failed"]);
    exit;
}
$tokenData = json_decode($resp, true);
$accessToken = $tokenData['access_token'] ?? '';
if (!$accessToken) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid token response"]);
    exit;
}

$ch = curl_init('https://discord.com/api/users/@me');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $accessToken],
]);
$userResp = curl_exec($ch);
$userHttp = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
if ($userHttp !== 200) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Failed to fetch user"]);
    exit;
}
$userData = json_decode($userResp, true);
$discordId = $userData['id'] ?? '';
if (!$discordId) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "User ID missing"]);
    exit;
}

$stmt = $pdo->prepare('SELECT guild_id FROM discord_servers WHERE whop_id = :wid LIMIT 1');
$stmt->execute(['wid' => $whopId]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
$guildId = $row['guild_id'] ?? '';
if (!$guildId) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "No Discord server configured"]);
    exit;
}

$ch = curl_init("https://discord.com/api/guilds/$guildId/members/$discordId");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => 'PUT',
    CURLOPT_HTTPHEADER => [
        'Authorization: Bot ' . $botToken,
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode(['access_token' => $accessToken]),
]);
$joinResp = curl_exec($ch);
$joinHttp = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
if ($joinHttp !== 201 && $joinHttp !== 204) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to join server"]);
    exit;
}

$stmt = $pdo->prepare('INSERT IGNORE INTO discord_members (guild_id, discord_id) VALUES (:gid, :did)');
$stmt->execute(['gid' => $guildId, 'did' => $discordId]);

$accUrl = 'https://discord.com/users/' . $discordId;
$ins = $pdo->prepare("INSERT INTO linked_accounts (user_id, platform, account_url, verify_code, is_verified, created_at, verified_at) VALUES (:uid, 'discord', :url, '', 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE account_url=VALUES(account_url), is_verified=1, verified_at=NOW()");
$ins->execute(['uid' => $user_id, 'url' => $accUrl]);

echo json_encode(['status' => 'success', 'guild_id' => $guildId]);
?>
