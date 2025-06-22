<?php
// instagram_author.php

// 1) CORS and JSON headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 2) Preflight OPTIONS handling
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 3) Validate 'url' query parameter
if (!isset($_GET['url']) || !filter_var($_GET['url'], FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing or invalid 'url' parameter"]);
    exit;
}
$url = $_GET['url'];

// 4) Fetch the Instagram page HTML
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
$html = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$html) {
    http_response_code(502);
    echo json_encode(["error" => "Failed to fetch Instagram page"]);
    exit;
}

// 5) Try to extract author from the Open Graph title meta tag
if (preg_match('/<meta property="og:title" content="([^"]+?) on Instagram"/i', $html, $matches)) {
    $author = $matches[1];
    echo json_encode(["author" => $author]);
    exit;
}

// 6) Fallback: parse JSON-LD for author name
if (preg_match('/<script type="application\/ld\+json">(.*?)<\/script>/is', $html, $matches2)) {
    $data = json_decode($matches2[1], true);
    if (!empty($data['author']['name'])) {
        echo json_encode(["author" => $data['author']['name']]);
        exit;
    }
}

// 7) If author not found, return error
http_response_code(500);
echo json_encode(["error" => "Author not found"]);
