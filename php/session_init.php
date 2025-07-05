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

// Auto-login via persistent token
if (!isset($_SESSION['user_id']) && !empty($_COOKIE['login_token'])) {
    require_once __DIR__ . '/config_login.php';
    $conn = new mysqli($servername, $db_username, $db_password, $database);
    if (!$conn->connect_error) {
        $tokenHash = hash('sha256', $_COOKIE['login_token']);
        $uaHash    = hash('sha256', $_SERVER['HTTP_USER_AGENT'] ?? '');
        $escHash   = $conn->real_escape_string($tokenHash);
        $escUa     = $conn->real_escape_string($uaHash);
        $res = $conn->query("SELECT id, user_id FROM user_tokens WHERE token_hash='$escHash' AND user_agent_hash='$escUa' AND expires_at > NOW() LIMIT 1");
        if ($res && $res->num_rows === 1) {
            $row = $res->fetch_assoc();
            $_SESSION['user_id'] = (int)$row['user_id'];
            // Rotate token
            $newToken  = bin2hex(random_bytes(32));
            $newHash   = hash('sha256', $newToken);
            $newExpiry = date('Y-m-d H:i:s', time() + 60 * 60 * 24 * 30);
            $escNewHash = $conn->real_escape_string($newHash);
            $conn->query("UPDATE user_tokens SET token_hash='$escNewHash', expires_at='$newExpiry', user_agent_hash='$escUa' WHERE id=" . (int)$row['id']);
            setcookie('login_token', $newToken, [
                'expires'  => time() + 60 * 60 * 24 * 30,
                'path'     => '/',
                'domain'   => $cookieParams['domain'],
                'secure'   => true,
                'httponly' => true,
                'samesite' => 'None',
            ]);
        } else {
            setcookie('login_token', '', [
                'expires' => time() - 3600,
                'path'    => '/',
                'domain'  => $cookieParams['domain'],
                'secure'  => true,
                'httponly'=> true,
                'samesite'=> 'None',
            ]);
        }
        $conn->close();
    }
}
?>
