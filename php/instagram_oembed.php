<?php
// instagram_oembed.php

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

// Validate that the 'url' parameter is present
if (!isset($_GET['url'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing 'url' parameter"]);
    exit;
}

// Validate that the provided URL is valid
$url = filter_var($_GET['url'], FILTER_VALIDATE_URL);
if (!$url) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid URL"]);
    exit;
}

// Build the oEmbed API request URL
$apiUrl = "https://api.instagram.com/oembed?url=" . urlencode($url);

// Fetch the oEmbed data
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Return the oEmbed response with the same HTTP status code
http_response_code($httpCode);
echo $response;
