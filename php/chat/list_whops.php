<?php
// php/chat/list_whops.php

// CORS & headers
$allowed = ["http://localhost:3000", "https://localhost:3000"];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed)) {
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
require_once __DIR__ . '/../session_init.php';
$user_id = $_SESSION['user_id'] ?? 0;
if ($user_id <= 0) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

require_once __DIR__ . "/../config_login.php";
$pdo = new PDO(
    "mysql:host=$servername;dbname=$database;charset=utf8mb4",
    $db_username,
    $db_password,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

// Fetch all Whops the user is a member of or has an active membership in
$sql = "
    SELECT DISTINCT w.id, w.name, w.logo_url
    FROM whops w
    LEFT JOIN whop_members m
      ON m.whop_id = w.id
     AND m.user_id = :uid
    LEFT JOIN memberships ms
      ON ms.whop_id = w.id
     AND ms.user_id = :uid
     AND ms.status = 'active'
    WHERE m.user_id IS NOT NULL
       OR ms.user_id IS NOT NULL
    ORDER BY w.name
";
$stmt = $pdo->prepare($sql);
$stmt->execute([':uid' => $user_id]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["status" => "success", "data" => $rows]);
