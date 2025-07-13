<?php
// config.php

// 1) Připojení k databázi
$servername  = "localhost";
$db_username = "dbadmin";
$db_password = "3otwj3zR6EI";
$database    = "byx";
$db = new mysqli($servername, $db_username, $db_password, $database);
if ($db->connect_error) {
    http_response_code(500);
    echo json_encode(['error'=>'DB connection failed']);
    exit;
}

// 2) JWT nastavení
const JWT_SECRET       = 'YOUR_VERY_STRONG_RANDOM_SECRET';
const JWT_ISSUER       = 'app.byxbot.com';
const ACCESS_TOKEN_EXP  = 3600;       // 1 hodina
const REFRESH_TOKEN_EXP = 2592000;    // 30 dní

// 3) Email “From” hlavička (mail() přes Google SMTP v php.ini)
const MAIL_FROM_EMAIL = 'no-reply@yourdomain.com';
const MAIL_FROM_NAME  = 'ByxBot';


// 4) Discord credentials (can also be provided via environment variables)
if (!defined('DISCORD_BOT_TOKEN')) {
    define('DISCORD_BOT_TOKEN', getenv('DISCORD_BOT_TOKEN') ?: '');
}
if (!defined('DISCORD_CLIENT_SECRET')) {
    define('DISCORD_CLIENT_SECRET', getenv('DISCORD_CLIENT_SECRET') ?: '5VHe23BNTpQsJV4IP8QsV04NSQR0ClgV');
}
if (!defined('DISCORD_CLIENT_ID')) {
    define('DISCORD_CLIENT_ID', getenv('DISCORD_CLIENT_ID') ?: '1391881188901388348');
}