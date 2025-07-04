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
?>
