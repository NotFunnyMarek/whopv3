<?php
// --- CORS & preliminaries ---
$allowed = ["http://localhost:3000", "https://localhost:3000"];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/../session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$input      = json_decode(file_get_contents("php://input"), true);
$msgId      = (int)($input['message_id'] ?? 0);
$react      = $input['reaction_type'] ?? '';
if (!$msgId || !in_array($react, ['like', 'smile', 'fire', 'heart', 'dislike'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid data"]);
    exit;
}

require_once __DIR__ . "/../config_login.php";
$pdo = new PDO(
    "mysql:host=$servername;dbname=$database;charset=utf8mb4",
    $db_username,
    $db_password,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

// Toggle reaction
$chk = $pdo->prepare("
    SELECT id FROM message_reactions
    WHERE message_id = ? AND user_id = ? AND reaction_type = ?
");
$chk->execute([$msgId, $user_id, $react]);
if ($chk->fetch()) {
    $pdo->prepare("
        DELETE FROM message_reactions
        WHERE message_id = ? AND user_id = ? AND reaction_type = ?
    ")->execute([$msgId, $user_id, $react]);
} else {
    $pdo->prepare("
        INSERT INTO message_reactions (message_id, user_id, reaction_type)
        VALUES (?, ?, ?)
    ")->execute([$msgId, $user_id, $react]);
}

echo json_encode(["status" => "success"]);
