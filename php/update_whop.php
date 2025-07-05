<?php
// =========================================
// File: php/update_whop.php
// =========================================

// 1) Suppress PHP error display and report all errors
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
            'message' => 'Fatal error: ' . ($err['message'] ?? 'Unknown error'),
        ]);
    }
});

// 3) Convert warnings/notices into JSON responses
set_error_handler(function($severity, $message, $file, $line) {
    http_response_code(400);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'status'  => 'error',
        'message' => "Error: $message in $file on line $line"
    ]);
    exit;
});

// 4) CORS & headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 5) Preflight OPTIONS check
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "Preflight OK"]);
    exit;
}

// 6) Read raw JSON body
$rawBody = file_get_contents('php://input');
if (!$rawBody) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Empty request body"]);
    exit;
}
$data = json_decode($rawBody, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON"]);
    exit;
}

// 7) Session & user validation
require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "User not logged in"]);
    exit;
}

// 8) Check required fields
$missing = [];
if (empty($data['slug']))        $missing[] = 'slug';
if (empty($data['name']))        $missing[] = 'name';
if (empty($data['description'])) $missing[] = 'description';
if (!isset($data['features']) || !is_array($data['features'])) {
    $missing[] = 'features';
}
if (count($missing) > 0) {
    http_response_code(400);
    echo json_encode([
      "status"  => "error",
      "message" => "Missing required fields: " . implode(', ', $missing)
    ]);
    exit;
}

// 9) Connect to database
require_once __DIR__ . '/config_login.php';
try {
    $pdo = new PDO(
        "mysql:host=$servername;dbname=$database;charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Database connection error: " . $e->getMessage()
    ]);
    exit;
}

// 10) Verify that the Whop exists and is owned by this user
try {
    $stmt = $pdo->prepare("
        SELECT id, owner_id 
          FROM whops 
         WHERE slug = :slug 
         LIMIT 1
    ");
    $stmt->execute([':slug' => $data['slug']]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Whop not found"]);
        exit;
    }
    if ((int)$row['owner_id'] !== (int)$user_id) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Insufficient permissions"]);
        exit;
    }
    $whopId = intval($row['id']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error fetching Whop: " . $e->getMessage()
    ]);
    exit;
}

// 11) Prepare data for updating the Whop
$bannerUrlSql   = !empty($data['bannerUrl']) ? $data['bannerUrl'] : "";
$price          = isset($data['price']) && is_numeric($data['price']) ? floatval($data['price']) : 0.00;
$currency       = isset($data['currency']) && trim($data['currency']) !== '' ? trim($data['currency']) : 'USD';
$is_recurring   = isset($data['is_recurring']) ? intval($data['is_recurring']) : 0;
$billing_period = isset($data['billing_period']) && trim($data['billing_period']) !== '' ? trim($data['billing_period']) : null;
$wait_enabled   = isset($data['waitlist_enabled']) ? intval($data['waitlist_enabled']) : 0;
$wait_questions = $wait_enabled && isset($data['waitlist_questions']) && is_array($data['waitlist_questions'])
    ? json_encode(array_values(array_filter($data['waitlist_questions'], fn($q)=>trim($q)!=='')))
    : json_encode([]);
$long_desc      = trim($data['long_description'] ?? '');
$about_bio      = trim($data['about_bio'] ?? '');
$website_url    = trim($data['website_url'] ?? '');
$socials_json   = isset($data['socials']) ? json_encode($data['socials'], JSON_UNESCAPED_UNICODE) : json_encode(new stdClass(), JSON_UNESCAPED_UNICODE);
$who_for_json   = isset($data['who_for']) ? json_encode($data['who_for'], JSON_UNESCAPED_UNICODE) : json_encode([], JSON_UNESCAPED_UNICODE);
$faq_json       = isset($data['faq']) ? json_encode($data['faq'], JSON_UNESCAPED_UNICODE) : json_encode([], JSON_UNESCAPED_UNICODE);
$landing_json   = isset($data['landing_texts']) ? json_encode($data['landing_texts'], JSON_UNESCAPED_UNICODE) : json_encode(new stdClass(), JSON_UNESCAPED_UNICODE);
$modules_json   = isset($data['modules']) ? json_encode($data['modules'], JSON_UNESCAPED_UNICODE) : json_encode(new stdClass(), JSON_UNESCAPED_UNICODE);

// 12) Update the Whop record
try {
    $updStmt = $pdo->prepare("
        UPDATE whops
           SET name               = :name,
               description        = :description,
               banner_url         = :banner_url,
               price              = :price,
               currency           = :currency,
               is_recurring       = :is_recurring,
               billing_period     = :billing_period,
               waitlist_enabled   = :wait_enabled,
               waitlist_questions = :wait_questions,
               long_description   = :long_desc,
               about_bio          = :about_bio,
               website_url        = :website_url,
               socials            = :socials,
               who_for            = :who_for,
               faq                = :faq,
               landing_texts      = :landing_texts,
               modules            = :modules
        WHERE id = :id
    ");
    $updStmt->execute([
        ':name'             => $data['name'],
        ':description'      => $data['description'],
        ':banner_url'       => $bannerUrlSql,
        ':price'            => $price,
        ':currency'         => $currency,
        ':is_recurring'     => $is_recurring,
        ':billing_period'   => $billing_period,
        ':wait_enabled'     => $wait_enabled,
        ':wait_questions'   => $wait_questions,
        ':long_desc'        => $long_desc,
        ':about_bio'        => $about_bio,
        ':website_url'      => $website_url,
        ':socials'          => $socials_json,
        ':who_for'          => $who_for_json,
        ':faq'              => $faq_json,
        ':landing_texts'    => $landing_json,
        ':modules'          => $modules_json,
        ':id'               => $whopId
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error updating Whop: " . $e->getMessage()
    ]);
    exit;
}

// 13) Delete existing features and insert the new set
try {
    $delStmt = $pdo->prepare("DELETE FROM whop_features WHERE whop_id = :whop_id");
    $delStmt->execute([':whop_id' => $whopId]);

    $insertFeatureStmt = $pdo->prepare("
        INSERT INTO whop_features (whop_id, title, subtitle, image_url)
        VALUES (:whop_id, :title, :subtitle, :image_url)
    ");
    foreach ($data['features'] as $feat) {
        if (empty($feat['title']) || empty($feat['imageUrl'])) {
            continue;
        }
        $insertFeatureStmt->execute([
            ':whop_id'   => $whopId,
            ':title'     => $feat['title'],
            ':subtitle'  => $feat['subtitle'] ?? "",
            ':image_url' => $feat['imageUrl'],
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error saving features: " . $e->getMessage()
    ]);
    exit;
}

// 14) Return success response
echo json_encode(["status" => "success"]);
exit;
