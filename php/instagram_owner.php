<?php
// instagram_owner.php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Validate URL parameter
if (!isset($_GET['url']) || !filter_var($_GET['url'], FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing or invalid 'url' parameter"]);
    exit;
}

$url = $_GET['url'];

// Fetch the Instagram page HTML
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
$html = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$html) {
    http_response_code(502);
    echo json_encode(["error" => "Unable to fetch Instagram page"]);
    exit;
}

// Extract JSON assigned to window._sharedData
if (!preg_match('/window\._sharedData\s*=\s*({.*});<\/script>/', $html, $matches)) {
    http_response_code(500);
    echo json_encode(["error" => "Shared data not found"]);
    exit;
}

$data = json_decode($matches[1], true);
if (
    !isset(
        $data['entry_data']['PostPage'][0]['graphql']['shortcode_media']['owner']['username']
    )
) {
    http_response_code(500);
    echo json_encode(["error" => "Owner not found in data"]);
    exit;
}

$username = $data['entry_data']['PostPage'][0]['graphql']['shortcode_media']['owner']['username'];
echo json_encode(["username" => $username]);
