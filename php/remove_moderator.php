<?php
// =========================================
// File: php/remove_moderator.php
// =========================================

// 1) CORS & headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2) Session and user authentication
session_start();
$user_id_raw = $_SESSION['user_id'] ?? null;
if (!$user_id_raw) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "Unauthorized – not logged in"
    ]);
    exit;
}
$user_id = intval($user_id_raw);

// 3) Read JSON body
$input = json_decode(file_get_contents('php://input'), true);
if (
    !$input ||
    !isset($input['whop_id']) ||
    !isset($input['mod_user_id'])
) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Missing whop_id or mod_user_id"
    ]);
    exit;
}
$whopId    = intval($input['whop_id']);
$modUserId = intval($input['mod_user_id']);

// 4) Connect to database
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
    echo json_encode([
        "status"  => "error",
        "message" => "Connection failed: " . $e->getMessage()
    ]);
    exit;
}

// 5) Fetch owner_id of the specified Whop
try {
    $stmtOwner = $pdo->prepare("
        SELECT owner_id
          FROM whops
         WHERE id = :whop_id
         LIMIT 1
    ");
    $stmtOwner->execute(['whop_id' => $whopId]);
    $rowOwner = $stmtOwner->fetch(PDO::FETCH_ASSOC);
    if (!$rowOwner) {
        http_response_code(404);
        echo json_encode([
            "status"  => "error",
            "message" => "Whop not found"
        ]);
        exit;
    }
    $ownerId = intval($rowOwner['owner_id']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error fetching Whop: " . $e->getMessage()
    ]);
    exit;
}

// 6) Authorization check – only the owner may remove a moderator
if ($user_id !== $ownerId) {
    http_response_code(403);
    echo json_encode([
        "status"  => "error",
        "message" => "Only the owner may remove a moderator"
    ]);
    exit;
}

// 7) Delete the moderator record
try {
    $stmtDel = $pdo->prepare("
        DELETE FROM whop_moderators
         WHERE whop_id   = :whop_id
           AND user_id   = :mod_user_id
    ");
    $stmtDel->execute([
        'whop_id'      => $whopId,
        'mod_user_id'  => $modUserId
    ]);
    echo json_encode([
        "status"  => "success",
        "message" => "Moderator has been removed"
    ]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error removing moderator: " . $e->getMessage()
    ]);
    exit;
}
