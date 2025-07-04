<?php
// resend_code.php - resend 2FA code for existing token

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
require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);
$token = $data['token'] ?? '';

if ($token === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing token']);
    exit;
}

$conn = new mysqli($servername, $db_username, $db_password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$tokenEsc = $conn->real_escape_string($token);
$res = $conn->query("SELECT id, user_id FROM two_factor_codes WHERE token='$tokenEsc' LIMIT 1");
if (!$res || $res->num_rows === 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid token']);
    $conn->close();
    exit;
}

$row = $res->fetch_assoc();
$userId = (int)$row['user_id'];

$userRes = $conn->query("SELECT email FROM users4 WHERE id=$userId LIMIT 1");
if (!$userRes || $userRes->num_rows === 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'User not found']);
    $conn->close();
    exit;
}

$emailRow = $userRes->fetch_assoc();
$email = $emailRow['email'];

$code = random_int(100000, 999999);
$hash = password_hash($code, PASSWORD_BCRYPT);
$expires = date('Y-m-d H:i:s', time() + 600); // 10 minutes
$hashEsc = $conn->real_escape_string($hash);

$conn->query("UPDATE two_factor_codes SET code_hash='$hashEsc', expires_at='$expires' WHERE id=" . (int)$row['id']);

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'verify.byx@gmail.com';
    $mail->Password = 'aqzz izve csfu quxc';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('verify.byx@gmail.com', 'Auth');
    $mail->addAddress($email);
    $mail->Subject = 'Your verification code';
    $mail->Body    = "Your verification code is: $code";
    $mail->send();
} catch (Exception $e) {
    error_log("Mailer Error: {$mail->ErrorInfo}");
}

$conn->close();

echo json_encode(['status' => 'resent']);
?>
