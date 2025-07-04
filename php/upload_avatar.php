<?php
// =========================================
// File: php/upload_avatar.php
// =========================================

// 1) CORS & Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 2) Preflight (CORS) check
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3) Start session to identify the user
require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "User is not logged in"
    ]);
    exit;
}

// 4) Verify that an 'avatar' file was uploaded without error
if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "File not sent or upload error occurred"
    ]);
    exit;
}

$file = $_FILES['avatar'];
$maxFileSize = 5 * 1024 * 1024; // 5 MB limit
if ($file['size'] > $maxFileSize) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "File is too large (max. 5 MB)"
    ]);
    exit;
}

// 5) Validate MIME type
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);
$allowedTypes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/gif'  => 'gif'
];
if (!isset($allowedTypes[$mimeType])) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Unsupported format (allowed: JPG, PNG, GIF)"
    ]);
    exit;
}

// 6) Determine upload directory (adjust path if needed)
$uploadDir = __DIR__ . '/../uploads/avatars/';
if (!is_dir($uploadDir)) {
    // Attempt to create the directory if it doesn't exist
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode([
            "status"  => "error",
            "message" => "Could not create upload directory"
        ]);
        exit;
    }
}

// 7) Generate a unique filename: userID_timestamp_random.ext
$extension = $allowedTypes[$mimeType];
$randomPart = bin2hex(random_bytes(6));
$filename = sprintf("%d_%d_%s.%s", $user_id, time(), $randomPart, $extension);
$destination = $uploadDir . $filename;

// 8) Move the uploaded file to its destination
if (!move_uploaded_file($file['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Failed to save uploaded file"
    ]);
    exit;
}

// 9) (Optional) you could create thumbnails here, etc.

// 10) Build the public URL for the uploaded avatar
// Adjust base URL according to your deployment
$baseUrl = "https://app.byxbot.com/uploads/avatars/";
$avatarUrl = $baseUrl . $filename;

// 11) Return success JSON with the new avatar URL
echo json_encode([
    "status"     => "success",
    "avatar_url" => $avatarUrl
]);
exit;
