<?php
// php/join_whop.php

// 1) Allowed origins (add all your domains here)
$allowed_origins = [
    "http://localhost:3000",
    "https://app.byxbot.com"
];

// Determine the request origin
$origin = $_SERVER['HTTP_ORIGIN'] ?? "";
if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
// Additional CORS headers
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
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
        "message" => "Unauthorized – you are not logged in"
    ]);
    exit;
}

// 3) Read JSON body
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['whop_id'])) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Missing whop_id"
    ]);
    exit;
}
$whop_id = intval($input['whop_id']);

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

// 5) Check if the user is banned
try {
    $banStmt = $pdo->prepare("
        SELECT 1
        FROM whop_bans
        WHERE whop_id = :whop_id
          AND user_id = :user_id
        LIMIT 1
    ");
    $banStmt->execute([
        'whop_id' => $whop_id,
        'user_id' => $user_id
    ]);
    if ($banStmt->fetch()) {
        http_response_code(403);
        echo json_encode([
            "status"  => "error",
            "message" => "You have been banned from this Whop."
        ]);
        exit;
    }
} catch (PDOException $e) {
    error_log("join_whop ban-check error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error checking ban status."
    ]);
    exit;
}

// 6) Verify that the Whop exists
try {
    $check = $pdo->prepare("
        SELECT id
        FROM whops
        WHERE id = :whop_id
        LIMIT 1
    ");
    $check->execute(['whop_id' => $whop_id]);
    if (!$check->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode([
            "status"  => "error",
            "message" => "Whop not found"
        ]);
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error loading Whop: " . $e->getMessage()
    ]);
    exit;
}

// 7) Attempt to insert membership (UNIQUE constraint prevents duplicates)
try {
    $insert = $pdo->prepare("
        INSERT INTO whop_members (user_id, whop_id)
        VALUES (:user_id, :whop_id)
    ");
    $insert->execute([
        'user_id' => $user_id,
        'whop_id' => $whop_id
    ]);
    echo json_encode([
        "status"  => "success",
        "message" => "You have joined the Whop."
    ]);
    exit;
} catch (PDOException $e) {
    // Duplicate entry → user already joined
    if ($e->getCode() === '23000') {
        http_response_code(409);
        echo json_encode([
            "status"  => "error",
            "message" => "You are already a member of this Whop."
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
