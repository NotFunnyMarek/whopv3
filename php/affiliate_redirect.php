<?php
// php/affiliate_redirect.php
// Usage: affiliate_redirect.php?code=ABC

require_once __DIR__ . '/config_login.php';
$code = isset($_GET['code']) ? $_GET['code'] : '';
if ($code === '') {
    http_response_code(400);
    echo 'Invalid affiliate link';
    exit;
}

$slug = '';
try {
    $pdo = new PDO(
        "mysql:host=$servername;dbname=$database;charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // increment click counter
    $upd = $pdo->prepare('UPDATE affiliate_links SET clicks = clicks + 1 WHERE code = :code');
    $upd->execute(['code' => $code]);

    // fetch slug of related whop for redirect
    $sel = $pdo->prepare(
        'SELECT w.slug FROM affiliate_links al JOIN whops w ON al.whop_id = w.id WHERE al.code = :code LIMIT 1'
    );
    $sel->execute(['code' => $code]);
    $slug = $sel->fetchColumn();
} catch (Exception $e) {
    // ignore any database errors
}

setcookie('affiliate_code', $code, [
    'expires'  => time() + 60 * 60 * 24 * 30,
    'path'     => '/',
    'secure'   => true,
    'httponly' => false,
    'samesite' => 'Lax',
]);

if ($slug) {
    header('Location: /c/' . rawurlencode($slug));
} else {
    header('Location: /');
}
exit;
