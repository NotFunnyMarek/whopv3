<?php
// php/get_whop_members.php

// ——————————————————————————————————————————————————————————
// 1) CORS & headers
// ——————————————————————————————————————————————————————————
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ——————————————————————————————————————————————————————————
// 2) Session & user check
// ——————————————————————————————————————————————————————————
session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

// ——————————————————————————————————————————————————————————
// 3) Database connection
// ——————————————————————————————————————————————————————————
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
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]);
    exit;
}

// ——————————————————————————————————————————————————————————
// 4) Fetch whop_id parameter
// ——————————————————————————————————————————————————————————
if (!isset($_GET['whop_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing 'whop_id'"]);
    exit;
}
$whop_id = intval($_GET['whop_id']);

// ——————————————————————————————————————————————————————————
// 5) Query all members of this Whop
// ——————————————————————————————————————————————————————————
try {
    $sql = "
        SELECT
            u.id AS user_id,
            u.username,
            m.start_time,
            m.end_time,
            m.is_active
        FROM whop_members AS m
        JOIN users4       AS u ON m.user_id = u.id
        WHERE m.whop_id = :whop_id
        ORDER BY u.username ASC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['whop_id' => $whop_id]);
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $members]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "SQL Error: " . $e->getMessage()]);
    exit;
}
