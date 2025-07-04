<?php
// =========================================
// php/delete_whop.php
// =========================================

// 1) CORS & headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 2) CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 3) Session & authentication
require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "User not logged in"]);
    exit;
}

// 4) Read request body for slug
$input = json_decode(file_get_contents("php://input"), true);
$slug = $input['slug'] ?? "";
if (!$slug) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing 'slug' parameter"]);
    exit;
}

// 5) Database connection (adjust as needed)
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
    echo json_encode(["status" => "error", "message" => "DB Error: " . $e->getMessage()]);
    exit;
}

// 6) Verify that the current user owns the Whop
try {
    $stmt = $pdo->prepare("SELECT id, user_id FROM whops WHERE slug = :slug LIMIT 1");
    $stmt->execute([':slug' => $slug]);
    $whop = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$whop) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Whop not found"]);
        exit;
    }
    if ($whop['user_id'] != $user_id) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "You do not have permission to delete this Whop"]);
        exit;
    }

    // 7) Delete associated features, then delete the Whop itself
    $delFeat = $pdo->prepare("DELETE FROM whop_features WHERE whop_id = :whopId");
    $delFeat->execute([':whopId' => $whop['id']]);

    $delWhop = $pdo->prepare("DELETE FROM whops WHERE id = :whopId");
    $delWhop->execute([':whopId' => $whop['id']]);

    echo json_encode(["status" => "success", "message" => "Whop successfully deleted"]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error deleting Whop: " . $e->getMessage()]);
    exit;
}
