<?php
// logout.php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/session_init.php';

// Remove persistent login token
$token = $_COOKIE['login_token'] ?? '';
if ($token !== '') {
    require_once __DIR__ . '/config_login.php';
    $conn = new mysqli($servername, $db_username, $db_password, $database);
    if (!$conn->connect_error) {
        $tokenHash = hash('sha256', $token);
        $esc = $conn->real_escape_string($tokenHash);
        $conn->query("DELETE FROM user_tokens WHERE token_hash='$esc'");
        $conn->close();
    }
    setcookie('login_token', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'domain' => '',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'None',
    ]);
}

session_unset();
session_destroy();

echo json_encode(["status" => "success", "message" => "Logged out"]);
exit;
