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

$input   = json_decode(file_get_contents("php://input"), true);
$whop_id = (int)($input['whop_id'] ?? 0);
$message = trim($input['message'] ?? '');
$reply_to = isset($input['reply_to']) ? (int)$input['reply_to'] : null;
if (!$whop_id || $message === "") {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing data"]);
    exit;
}

require_once __DIR__ . "/../config_login.php";
$pdo = new PDO(
    "mysql:host=$servername;dbname=$database;charset=utf8mb4",
    $db_username,
    $db_password,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

// 1) Check for mute
$stmt = $pdo->prepare("SELECT mute_until FROM user_mutes WHERE user_id = ?");
$stmt->execute([$user_id]);
if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    if (new DateTime() < new DateTime($row['mute_until'])) {
        echo json_encode(["status" => "error", "message" => "Muted until {$row['mute_until']}"]);
        exit;
    } else {
        $pdo->prepare("DELETE FROM user_mutes WHERE user_id = ?")
            ->execute([$user_id]);
    }
}

// 2) Check spam (max 3 messages per 10 seconds)
$chk = $pdo->prepare(
    "SELECT COUNT(*) FROM chat_messages
     WHERE user_id = ? AND created_at > (NOW() - INTERVAL 10 SECOND)"
);
$chk->execute([$user_id]);
if ((int)$chk->fetchColumn() >= 3) {
    $muteUntil = (new DateTime())
        ->add(new DateInterval('PT30S'))
        ->format('Y-m-d H:i:s');
    $up = $pdo->prepare(
        "INSERT INTO user_mutes (user_id, mute_until)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE mute_until = ?"
    );
    $up->execute([$user_id, $muteUntil, $muteUntil]);
    echo json_encode(["status" => "error", "message" => "Too many messages – muted for 30 seconds."]);
    exit;
}

// 3) Retrieve username
$username = $_SESSION['username']
    ?? (function() use ($servername, $db_username, $db_password, $database, $user_id) {
        $db = new mysqli($servername, $db_username, $db_password, $database);
        $r = $db->query("SELECT username FROM users4 WHERE id=" . intval($user_id));
        $u = $r && $r->num_rows ? $r->fetch_assoc()['username'] : null;
        $db->close();
        return $u;
    })();

// 4) Insert chat message
$stmt = $pdo->prepare(
    "INSERT INTO chat_messages (whop_id, user_id, username, message, reply_to)
     VALUES (:wid, :uid, :uname, :msg, :rto)"
);
$stmt->execute([
    ':wid'   => $whop_id,
    ':uid'   => $user_id,
    ':uname' => $username,
    ':msg'   => $message,
    ':rto'   => $reply_to
]);

$newId = $pdo->lastInsertId();
$ts = (int)(microtime(true) * 1000);
echo json_encode([
    "status"  => "success",
    "message" => [
        "id"         => $newId,
        "user_id"    => $user_id,
        "username"   => $username,
        "message"    => $message,
        "reply_to"   => $reply_to,
        "ts"         => $ts,
        "avatar_url" => $_SESSION['avatar_url'] ?? null
    ]
]);
