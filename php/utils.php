<?php
// utils.php
require_once __DIR__ . '/vendor/autoload.php';  // pro JWT (firebase/php-jwt)
use Firebase\JWT\JWT;

/**
 * Vygeneruje JWT access token.
 */
function generate_jwt(int $userId): string {
    $now = time();
    $payload = [
      'iss' => JWT_ISSUER,
      'iat' => $now,
      'exp' => $now + ACCESS_TOKEN_EXP,
      'sub' => $userId
    ];
    return JWT::encode($payload, JWT_SECRET, 'HS256');
}

/**
 * Uloží refresh token do DB a nastaví HTTP-only cookie.
 */
function set_refresh_cookie(mysqli $db, int $userId): void {
    $token   = bin2hex(random_bytes(64));
    $expires = date('Y-m-d H:i:s', time() + REFRESH_TOKEN_EXP);
    $stmt = $db->prepare(
      "INSERT INTO user_refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)"
    );
    $stmt->bind_param('iss', $userId, $token, $expires);
    $stmt->execute();
    setcookie('refreshToken', $token, [
      'expires'  => time() + REFRESH_TOKEN_EXP,
      'path'     => '/',
      'domain'   => 'app.byxbot.com',
      'secure'   => true,
      'httponly' => true,
      'samesite' => 'None'
    ]);
}

/**
 * Vygeneruje 6místný 2FA kód, uloží do DB a pošle mail().
 */
function send_2fa_code(string $email, int $userId, mysqli $db): void {
    $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expiresAt = date('Y-m-d H:i:s', time() + 600); // +10 minut
    $stmt = $db->prepare(
      "INSERT INTO user_2fa_codes (user_id, code, expires_at) VALUES (?, ?, ?)"
    );
    $stmt->bind_param('iss', $userId, $code, $expiresAt);
    $stmt->execute();

    $subject = 'ByxBot: váš ověřovací kód';
    $message = "Dobrý den,\n\nváš ověřovací kód je: {$code}\nPlatnost 10 minut.\n\n— ByxBot";
    $headers = "From: " . MAIL_FROM_NAME . " <" . MAIL_FROM_EMAIL . ">\r\n"
             . "Reply-To: " . MAIL_FROM_EMAIL . "\r\n"
             . "Content-Type: text/plain; charset=UTF-8\r\n";

    mail($email, $subject, $message, $headers);
}
