<?php
// --- CORS setup ---
$allowed = ["http://localhost:3000", "https://localhost:3000"];
if (!empty($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header("Content-Type: application/json; charset=UTF-8");
session_start();
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

require_once __DIR__ . "/../config_login.php";
$currentUserId = (int) $_SESSION['user_id'];

$whop_id   = (int) ($_GET['whop_id']   ?? 0);
$before_id = isset($_GET['before_id']) ? (int) $_GET['before_id'] : null;
$last_id   = isset($_GET['last_id'])   ? (int) $_GET['last_id']   : null;
$limit     = 15;

try {
    $pdo = new PDO(
        "mysql:host=$servername;dbname=$database;charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    if ($before_id) {
        // Fetch messages older than a given message ID (pagination backwards)
        $sql = "
            SELECT cm.id, cm.user_id, cm.username, cm.message, cm.reply_to,
                   UNIX_TIMESTAMP(cm.created_at)*1000 AS ts,
                   u.avatar_url
            FROM chat_messages cm
            JOIN users4 u ON u.id = cm.user_id
            WHERE cm.whop_id = :wid
              AND cm.id < :bid
            ORDER BY cm.id DESC
            LIMIT :lim
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':bid', $before_id, PDO::PARAM_INT);
        $stmt->bindValue(':lim', $limit,    PDO::PARAM_INT);
    } elseif ($last_id) {
        // Fetch messages newer than a given message ID (live updates)
        $sql = "
            SELECT cm.id, cm.user_id, cm.username, cm.message, cm.reply_to,
                   UNIX_TIMESTAMP(cm.created_at)*1000 AS ts,
                   u.avatar_url
            FROM chat_messages cm
            JOIN users4 u ON u.id = cm.user_id
            WHERE cm.whop_id = :wid
              AND cm.id > :lid
            ORDER BY cm.id ASC
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lid', $last_id, PDO::PARAM_INT);
    } else {
        // Fetch most recent messages (initial load)
        $sql = "
            SELECT cm.id, cm.user_id, cm.username, cm.message, cm.reply_to,
                   UNIX_TIMESTAMP(cm.created_at)*1000 AS ts,
                   u.avatar_url
            FROM chat_messages cm
            JOIN users4 u ON u.id = cm.user_id
            WHERE cm.whop_id = :wid
            ORDER BY cm.id DESC
            LIMIT :lim
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    }

    $stmt->bindValue(':wid', $whop_id, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Reverse order so that older messages come first when paginating backwards
    if ($before_id || !$last_id) {
        $rows = array_reverse($rows);
    }

    // Load reaction counts for these messages
    $msgIds = array_column($rows, 'id');
    $reactions = [];
    if ($msgIds) {
        $in  = str_repeat('?,', count($msgIds) - 1) . '?';
        $rstm = $pdo->prepare("
            SELECT message_id, reaction_type, COUNT(*) AS cnt
            FROM message_reactions
            WHERE message_id IN ($in)
            GROUP BY message_id, reaction_type
        ");
        $rstm->execute($msgIds);
        foreach ($rstm as $r) {
            $reactions[$r['message_id']][$r['reaction_type']] = (int)$r['cnt'];
        }
    }

    // Build the response payload
    $messages = array_map(function($m) use ($currentUserId, $reactions) {
        return [
            "id"         => (int)$m["id"],
            "user_id"    => (int)$m["user_id"],
            "username"   => $m["username"],
            "message"    => $m["message"],
            "reply_to"   => $m["reply_to"] !== null ? (int)$m["reply_to"] : null,
            "ts"         => (int)$m["ts"],
            "avatar_url" => $m["avatar_url"],
            "mine"       => ((int)$m["user_id"] === $currentUserId),
            "reactions"  => $reactions[$m["id"]] ?? []
        ];
    }, $rows);

    // Determine if there are more messages available for pagination
    $hasMore = false;
    if ($before_id || !$last_id) {
        $hasMore = count($rows) === $limit;
    }

    echo json_encode([
        "status"   => "success",
        "messages" => $messages,
        "hasMore"  => $hasMore
    ]);
} catch (Exception $e) {
    // On error, return a JSON error message
    http_response_code(200);
    echo json_encode([
        "status"  => "error",
        "message" => $e->getMessage()
    ]);
}
