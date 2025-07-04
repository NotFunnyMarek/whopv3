<?php
// ========================================
// php/upload_whop_image.php
// ========================================

// 1) Redirect all PHP errors to our JSON handler
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// 2) Register shutdown handler to catch fatal errors and return JSON
register_shutdown_function(function() {
    $err = error_get_last();
    if ($err !== null) {
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'status'  => 'error',
            'message' => 'Internal Server Error: ' . ($err['message'] ?? 'Unknown error'),
        ]);
    }
});

// 3) Convert warnings/notices into JSON responses
set_error_handler(function($severity, $message, $file, $line) {
    http_response_code(400);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'status'  => 'error',
        'message' => "Warning/Error: $message in $file on line $line",
    ]);
    exit;
});

// 4) CORS settings (adjust origin for production)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 5) Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "OK"]);
    exit;
}

// 6) Start session and verify user is logged in
require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "User not logged in"]);
    exit;
}

// 7) Check that a file was uploaded under 'image'
if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No file was uploaded"]);
    exit;
}

$file = $_FILES['image'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    $errorCode = $file['error'];
    $errorMap = [
        UPLOAD_ERR_INI_SIZE   => 'File exceeds upload_max_filesize in php.ini',
        UPLOAD_ERR_FORM_SIZE  => 'File exceeds MAX_FILE_SIZE in HTML form',
        UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded',
        UPLOAD_ERR_NO_FILE    => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION  => 'File upload stopped by extension',
    ];
    $errMsg = $errorMap[$errorCode] ?? "Unknown upload error (code $errorCode)";
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $errMsg]);
    exit;
}

// 8) Validate file size (max 5 MB)
$maxFileSize = 5 * 1024 * 1024;
if ($file['size'] > $maxFileSize) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "File is too large (max 5 MB)"]);
    exit;
}

// 9) Validate MIME type
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);
$allowedTypes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/gif'  => 'gif'
];
if (!isset($allowedTypes[$mimeType])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Unsupported format (allowed: JPG, PNG, GIF)"]);
    exit;
}

// 10) Determine upload directory
$uploadDir = __DIR__ . '/../uploads/whop_images/';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to create upload directory"]);
    exit;
}
if (!is_writable($uploadDir)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Upload directory is not writable"]);
    exit;
}

// 11) Generate unique filename
$extension = $allowedTypes[$mimeType];
$randomPart = bin2hex(random_bytes(6));
$filename = sprintf("%d_%d_%s.%s", $user_id, time(), $randomPart, $extension);
$destination = $uploadDir . $filename;

// 12) Move uploaded file to destination
if (!move_uploaded_file($file['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to save uploaded file"]);
    exit;
}

// 13) Build public URL for the uploaded image (adjust for your production setup)
$baseUrl = "https://app.byxbot.com/uploads/whop_images/";
$imageUrl = $baseUrl . $filename;

// 14) Return success JSON
echo json_encode([
    "status"    => "success",
    "image_url" => $imageUrl
]);
exit;
