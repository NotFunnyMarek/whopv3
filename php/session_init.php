<?php
$cookieParams = session_get_cookie_params();
session_set_cookie_params([
    'lifetime' => 60 * 60 * 24 * 30, // 30 days
    'path'     => $cookieParams['path'],
    'domain'   => $cookieParams['domain'],
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'None',
]);
ini_set('session.gc_maxlifetime', 60 * 60 * 24 * 30);
session_start();

// --- Optional JWT auth fallback ---
if (!isset($_SESSION['user_id']) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    require_once __DIR__ . '/config.php';
    require_once __DIR__ . '/vendor/autoload.php';
    $auth = $_SERVER['HTTP_AUTHORIZATION'];
    if (preg_match('/Bearer\s+(.*)/', $auth, $m)) {
        $jwt = $m[1];
        try {
            $payload = Firebase\JWT\JWT::decode($jwt, new Firebase\JWT\Key(JWT_SECRET, 'HS256'));
            if ($payload && isset($payload->sub) && $payload->exp >= time()) {
                $_SESSION['user_id'] = (int)$payload->sub;
            }
        } catch (Exception $e) {
            // ignore invalid token
        }
    }
}
?>
