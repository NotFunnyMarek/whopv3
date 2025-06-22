<?php
// =========================================
// File: php/update_whop_slug.php
// =========================================

// 1) CORS & headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 2) Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 3) Start session and verify user is logged in
session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "User not logged in"
    ]);
    exit;
}

// 4) Parse JSON body
$input   = json_decode(file_get_contents("php://input"), true);
$oldSlug = $input['oldSlug'] ?? "";
$newSlug = $input['newSlug'] ?? "";

if (!$oldSlug || !$newSlug) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Missing parameter oldSlug or newSlug"
    ]);
    exit;
}

// 5) Connect to database
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
        "message" => "Database connection error: " . $e->getMessage()
    ]);
    exit;
}

try {
    // 6) Verify ownership and existence of the old slug
    $stmt = $pdo->prepare("
        SELECT id, user_id
          FROM whops
         WHERE slug = :oldSlug
         LIMIT 1
    ");
    $stmt->execute([':oldSlug' => $oldSlug]);
    $whop = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$whop) {
        http_response_code(404);
        echo json_encode([
            "status"  => "error",
            "message" => "Whop with that slug not found"
        ]);
        exit;
    }

    if ($whop['user_id'] != $user_id) {
        http_response_code(403);
        echo json_encode([
            "status"  => "error",
            "message" => "You do not have permission to change this Whop's slug"
        ]);
        exit;
    }

    // 7) Check if the new slug is already in use
    $check = $pdo->prepare("
        SELECT COUNT(*) FROM whops WHERE slug = :newSlug
    ");
    $check->execute([':newSlug' => $newSlug]);
    $count = (int)$check->fetchColumn();

    if ($count > 0) {
        http_response_code(409);
        echo json_encode([
            "status"  => "error",
            "message" => "The chosen slug already exists"
        ]);
        exit;
    }

    // 8) Perform the slug update
    $update = $pdo->prepare("
        UPDATE whops
           SET slug = :newSlug
         WHERE id = :whopId
    ");
    $update->execute([
        ':newSlug' => $newSlug,
        ':whopId'  => $whop['id'],
    ]);

    // 9) Return success response
    echo json_encode([
        "status"  => "success",
        "oldSlug" => $oldSlug,
        "newSlug" => $newSlug
    ]);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error updating slug: " . $e->getMessage()
    ]);
    exit;
}
