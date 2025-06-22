<?php
// php/reject_waitlist.php

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

// 2) Session & user authentication (must be the owner)
session_start();
$owner_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
if ($owner_id <= 0) {
    http_response_code(401);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Unauthorized – not logged in'
    ]);
    exit;
}

// 3) Read input JSON
$input      = json_decode(file_get_contents('php://input'), true);
$request_id = isset($input['request_id']) ? (int)$input['request_id'] : 0;
$whop_id    = isset($input['whop_id'])    ? (int)$input['whop_id']    : 0;
if ($request_id <= 0 || $whop_id <= 0) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Missing request_id or whop_id'
    ]);
    exit;
}

// 4) Database connection
require_once __DIR__ . '/config_login.php';
try {
    $pdo = new PDO(
        "mysql:host={$servername};dbname={$database};charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Connection failed: ' . $e->getMessage()
    ]);
    exit;
}

// 5) Verify that the request exists and that the current user is the owner
try {
    $stmt = $pdo->prepare("
        SELECT w.owner_id
          FROM waitlist_requests AS wr
          JOIN whops             AS w  ON wr.whop_id = w.id
         WHERE wr.user_id = :rid
           AND wr.whop_id = :wid
           AND wr.status  = 'pending'
         LIMIT 1
    ");
    $stmt->execute([
        'rid' => $request_id,
        'wid' => $whop_id
    ]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode([
            'status'  => 'error',
            'message' => 'Request not found or already handled'
        ]);
        exit;
    }
    if ((int)$row['owner_id'] !== $owner_id) {
        http_response_code(403);
        echo json_encode([
            'status'  => 'error',
            'message' => 'Forbidden – you are not the owner of this Whop'
        ]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
    exit;
}

// 6) Delete the waitlist request (reject it)
try {
    $del = $pdo->prepare("
        DELETE FROM waitlist_requests
         WHERE user_id = :rid
           AND whop_id = :wid
    ");
    $del->execute([
        'rid' => $request_id,
        'wid' => $whop_id
    ]);
    echo json_encode([
        'status'  => 'success',
        'message' => 'The request has been rejected and removed'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
