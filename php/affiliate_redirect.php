<?php
// php/affiliate_redirect.php
// Usage: affiliate_redirect.php?code=ABC&whop_id=1

require_once __DIR__ . '/config_login.php';
$code    = isset($_GET['code']) ? $_GET['code'] : '';
$whop_id = isset($_GET['whop_id']) ? (int)$_GET['whop_id'] : 0;
if ($code === '' || $whop_id <= 0) {
    http_response_code(400);
    echo "Invalid affiliate link";
    exit;
}

try {
    $pdo = new PDO(
        "mysql:host=$servername;dbname=$database;charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $upd = $pdo->prepare("UPDATE affiliate_links SET clicks = clicks + 1 WHERE code=:code AND whop_id=:wid");
    $upd->execute(['code' => $code, 'wid' => $whop_id]);
} catch (Exception $e) {
    // ignore
}

setcookie('affiliate_code', $code, [
    'expires'  => time() + 60 * 60 * 24 * 30,
    'path'     => '/',
    'secure'   => true,
    'httponly' => false,
    'samesite' => 'Lax',
]);

header('Location: /');
exit;
