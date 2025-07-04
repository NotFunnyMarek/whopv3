<?php
// php/invite_moderator.php

// ──────────────────────────────────────────────────────────────────────────────
// 1) CORS & headers
// ──────────────────────────────────────────────────────────────────────────────
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ──────────────────────────────────────────────────────────────────────────────
// 2) Session & user authentication
// ──────────────────────────────────────────────────────────────────────────────
require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "Unauthorized – you are not logged in"
    ]);
    exit;
}
$user_id = intval($user_id);

// ──────────────────────────────────────────────────────────────────────────────
// 3) Read JSON input
// ──────────────────────────────────────────────────────────────────────────────
$input = json_decode(file_get_contents('php://input'), true);
if (
    !$input ||
    !isset($input['whop_id']) ||
    !isset($input['email']) ||
    trim($input['email']) === ""
) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Missing whop_id or invalid email"
    ]);
    exit;
}
$whopId = intval($input['whop_id']);
$email  = trim($input['email']);

// ──────────────────────────────────────────────────────────────────────────────
// 4) Database connection
// ──────────────────────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────────────────
// 5) Retrieve the owner_id of the specified Whop
// ──────────────────────────────────────────────────────────────────────────────
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
        "message" => "Error loading whop: " . $e->getMessage()
    ]);
    exit;
}

// ──────────────────────────────────────────────────────────────────────────────
// 6) Check that the requester is the owner
// ──────────────────────────────────────────────────────────────────────────────
if ($user_id !== $ownerId) {
    http_response_code(403);
    echo json_encode([
        "status"  => "error",
        "message" => "Only the owner can invite moderators"
    ]);
    exit;
}

// ──────────────────────────────────────────────────────────────────────────────
// 7) Find the user_id by email
// ──────────────────────────────────────────────────────────────────────────────
try {
    $stmtUser = $pdo->prepare("
        SELECT id
        FROM users4
        WHERE email = :email
        LIMIT 1
    ");
    $stmtUser->execute(['email' => $email]);
    $rowUser = $stmtUser->fetch(PDO::FETCH_ASSOC);
    if (!$rowUser) {
        http_response_code(404);
        echo json_encode([
            "status"  => "error",
            "message" => "No user found with this email"
        ]);
        exit;
    }
    $moderatorId = intval($rowUser['id']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error searching for user: " . $e->getMessage()
    ]);
    exit;
}

// ──────────────────────────────────────────────────────────────────────────────
// 8) Attempt to insert into whop_moderators (UNIQUE constraint prevents duplicates)
// ──────────────────────────────────────────────────────────────────────────────
try {
    $stmtInsert = $pdo->prepare("
        INSERT INTO whop_moderators (user_id, whop_id)
        VALUES (:user_id, :whop_id)
    ");
    $stmtInsert->execute([
        'user_id' => $moderatorId,
        'whop_id' => $whopId
    ]);
    echo json_encode([
        "status"  => "success",
        "message" => "Moderator invited"
    ]);
    exit;
} catch (PDOException $e) {
    // Duplicate entry → user is already a moderator (SQLSTATE 23000)
    if ($e->getCode() === '23000') {
        http_response_code(409);
        echo json_encode([
            "status"  => "error",
            "message" => "User is already a moderator"
        ]);
        exit;
    }
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "SQL Error: " . $e->getMessage()
    ]);
    exit;
}
