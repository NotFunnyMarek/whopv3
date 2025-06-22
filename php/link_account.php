<?php
// link_account.php

// 1) CORS and JSON headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Start session and check authorization
session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

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
    echo json_encode(["status" => "error", "message" => "Database connection error"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Retrieve all linked accounts for the user
    $stmt = $pdo->prepare("
        SELECT id, platform, account_url, is_verified, created_at, verified_at 
        FROM linked_accounts 
        WHERE user_id = :uid
    ");
    $stmt->execute(['uid' => $user_id]);
    echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['action'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing action"]);
        exit;
    }

    if ($input['action'] === 'create') {
        $platform = $input['platform'] ?? '';
        $url      = trim($input['account_url'] ?? '');

        if (!in_array($platform, ['instagram','tiktok','youtube']) || !filter_var($url, FILTER_VALIDATE_URL)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid platform or URL"]);
            exit;
        }

        // 1) Check if the user already has this exact URL
        $checkOwn = $pdo->prepare("
            SELECT id, is_verified 
            FROM linked_accounts 
            WHERE user_id = :uid AND account_url = :url 
            LIMIT 1
        ");
        $checkOwn->execute(['uid' => $user_id, 'url' => $url]);
        $exists = $checkOwn->fetch(PDO::FETCH_ASSOC);
        if ($exists) {
            http_response_code(409);
            $msg = $exists['is_verified']
                ? "Account is already linked and verified."
                : "Account has been added but is not yet verified.";
            echo json_encode(["status" => "error", "message" => $msg]);
            exit;
        }

        // 2) Ensure the URL is not linked by another user
        $uniq = $pdo->prepare("
            SELECT id 
            FROM linked_accounts 
            WHERE account_url = :url AND user_id != :uid 
            LIMIT 1
        ");
        $uniq->execute(['url' => $url, 'uid' => $user_id]);
        if ($uniq->fetch()) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "This account is already linked to another user"]);
            exit;
        }

        // 3) Generate verification code and INSERT
        try {
            $code = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
            $ins = $pdo->prepare("
                INSERT INTO linked_accounts 
                  (user_id, platform, account_url, verify_code) 
                VALUES 
                  (:uid, :plat, :url, :code)
            ");
            $ins->execute([
                'uid'  => $user_id,
                'plat' => $platform,
                'url'  => $url,
                'code' => $code
            ]);
            echo json_encode([
                "status" => "success",
                "data"   => ["id" => $pdo->lastInsertId(), "verify_code" => $code]
            ]);
            exit;
        } catch (PDOException $e) {
            // Unexpected INSERT error
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error saving, please try again."]);
            exit;
        }
    }

    if ($input['action'] === 'verify') {
        $id = intval($input['id'] ?? 0);
        $stmt = $pdo->prepare("
            SELECT account_url, verify_code 
            FROM linked_accounts 
            WHERE id = :id AND user_id = :uid AND is_verified = 0 
            LIMIT 1
        ");
        $stmt->execute(['id' => $id, 'uid' => $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Verification item not found"]);
            exit;
        }
        $url  = $row['account_url'];
        $code = $row['verify_code'];

        // Simple bio fetch (cURL)
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
        $html = curl_exec($ch);
        curl_close($ch);
        if (!$html || stripos($html, htmlspecialchars($code)) === false) {
            http_response_code(400);
            echo json_encode(["stat]()_
