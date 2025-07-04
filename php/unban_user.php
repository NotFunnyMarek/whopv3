<?php
// =========================================
// File: php/unban_user.php
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

// 2) Session & user authentication
require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "Unauthorized – not logged in"
    ]);
    exit;
}
$user_id = intval($user_id);

// 3) Read JSON body
$input = json_decode(file_get_contents('php://input'), true);
if (
    !$input ||
    !isset($input['whop_id']) ||
    !isset($input['ban_user_id'])
) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Missing whop_id or ban_user_id"
    ]);
    exit;
}
$whopId    = intval($input['whop_id']);
$banUserId = intval($input['ban_user_id']);

// 4) Database connection
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

// 5) Fetch the owner_id of the given whop
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
        "message" => "Error fetching whop: " . $e->getMessage()
    ]);
    exit;
}

// 6) Determine role (owner / moderator / other) for the logged-in user
$role = "";
if ($user_id === $ownerId) {
    $role = "owner";
} else {
    // Check if the user is a moderator
    try {
        $stmtMod = $pdo->prepare("
            SELECT 1
              FROM whop_moderators
             WHERE whop_id = :whop_id
               AND user_id = :user_id
             LIMIT 1
        ");
        $stmtMod->execute([
            'whop_id' => $whopId,
            'user_id' => $user_id
        ]);
        if ($stmtMod->fetch()) {
            $role = "moderator";
        }
    } catch (PDOException $e) {
        // On error, leave role empty
    }
}

if ($role !== "owner" && $role !== "moderator") {
    http_response_code(403);
    echo json_encode([
        "status"  => "error",
        "message" => "You do not have permission to unban users"
    ]);
    exit;
}

// 7) Remove the ban record from whop_bans
try {
    $stmtDel = $pdo->prepare("
        DELETE FROM whop_bans
         WHERE whop_id = :whop_id
           AND user_id = :ban_user_id
    ");
    $stmtDel->execute([
        'whop_id'     => $whopId,
        'ban_user_id' => $banUserId
    ]);
    echo json_encode([
        "status"  => "success",
        "message" => "User has been unbanned"
    ]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error during unban: " . $e->getMessage()
    ]);
    exit;
}
