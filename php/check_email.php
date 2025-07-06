<?php
// check_email.php - check if email exists in users4
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config_login.php';

$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);
$email = trim($data['email'] ?? '');

if ($email === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email']);
    exit;
}

$conn = new mysqli($servername, $db_username, $db_password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$emailEsc = $conn->real_escape_string($email);
$res = $conn->query("SELECT id FROM users4 WHERE email='$emailEsc' AND is_verified=1 LIMIT 1");
$exists = $res && $res->num_rows > 0;
$conn->close();

echo json_encode(['exists' => $exists]);

