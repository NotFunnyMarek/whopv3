<?php
// CORS and JSON headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Session authorization
session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// Database connection
require_once __DIR__ . "/config_login.php";
try {
    $pdo = new PDO(
        "mysql:host=$servername;dbname=$database;charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed"]);
    exit;
}

// Fetch submissions for a given campaign and status
$campaign_id = intval($_GET['campaign_id']);
$status      = $_GET['status'];

$stmt = $pdo->prepare("
  SELECT 
    s.id,
    s.link,
    s.status,
    s.total_views,
    u.username
  FROM submissions AS s
  JOIN users4      AS u ON s.user_id = u.id
  WHERE s.campaign_id = :cid
    AND s.status = :st
  ORDER BY s.created_at DESC
");
$stmt->execute([
    'cid' => $campaign_id,
    'st'  => $status
]);

$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return the result as JSON
echo json_encode(["data" => $data]);
