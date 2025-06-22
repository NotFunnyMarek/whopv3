<?php
// php/whop.php

// =========================================
// CORS & headers
// =========================================
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Preflight OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =========================================
// Session to determine user_id
// =========================================
session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "Unauthorized: not logged in"
    ]);
    exit;
}

// =========================================
// Connect to database
// =========================================
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
        "message" => "Connection failed: " . $e->getMessage()
    ]);
    exit;
}

// =========================================
// Handle GET / POST
// =========================================
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // GET with parameter 'slug': return details and pricing for that Whop
    if (isset($_GET['slug'])) {
        $slug = trim($_GET['slug']);
        try {
            $sql = "
                SELECT
                  w.id,
                  w.owner_id,
                  u.username AS owner_username,
                  w.name,
                  w.slug,
                  w.description,
                  w.logo_url,
                  w.banner_url,
                  w.price,
                  w.billing_period,
                  w.is_recurring,
                  w.currency,
                  w.created_at
                FROM whops AS w
                JOIN users4 AS u ON w.owner_id = u.id
                WHERE w.slug = :slug
                LIMIT 1
            ";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['slug' => $slug]);
            $whop = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$whop) {
                http_response_code(404);
                echo json_encode([
                    "status"  => "error",
                    "message" => "Whop not found"
                ]);
                exit;
            }
            echo json_encode([
                "status" => "success",
                "data"   => $whop
            ]);
            exit;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "status"  => "error",
                "message" => "SQL Error: " . $e->getMessage()
            ]);
            exit;
        }
    }

    // GET with 'owner=me': return list of Whops owned by the logged-in user
    if (isset($_GET['owner']) && $_GET['owner'] === 'me') {
        try {
            $sql = "
              SELECT
                w.id,
                w.name,
                w.slug,
                w.description,
                w.logo_url,
                w.banner_url,
                w.price,
                w.billing_period,
                w.is_recurring,
                w.currency,
                w.created_at
              FROM whops AS w
              WHERE w.owner_id = :owner_id
              ORDER BY w.created_at DESC
            ";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['owner_id' => $user_id]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode([
                "status" => "success",
                "data"   => $rows
            ]);
            exit;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "status"  => "error",
                "message" => "SQL Error: " . $e->getMessage()
            ]);
            exit;
        }
    }

    // Missing required GET parameter
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Missing GET parameter 'slug' or 'owner=me'"
    ]);
    exit;

} elseif ($method === 'POST') {
    // POST: create a new Whop, only for logged-in users
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode([
            "status"  => "error",
            "message" => "Invalid JSON body"
        ]);
        exit;
    }

    // Required fields: name, description, slug, price, billing_period, is_recurring, currency
    $required = ['name', 'description', 'slug', 'price', 'billing_period', 'is_recurring', 'currency'];
    foreach ($required as $f) {
        if (!isset($input[$f]) || trim((string)$input[$f]) === "") {
            http_response_code(400);
            echo json_encode([
                "status"  => "error",
                "message" => "Missing required field '$f'"
            ]);
            exit;
        }
    }
    $name           = trim($input['name']);
    $description    = trim($input['description']);
    $slug           = trim($input['slug']);
    $price          = floatval($input['price']);
    $billing_period = trim($input['billing_period']);
    $is_recurring   = intval($input['is_recurring']);
    $currency       = trim($input['currency']);
    $logoUrl        = !empty($input['logoUrl'])   ? trim($input['logoUrl'])   : "";
    $bannerUrl      = !empty($input['bannerUrl']) ? trim($input['bannerUrl']) : "";

    // Check slug uniqueness
    try {
        $check = $pdo->prepare("SELECT id FROM whops WHERE slug = :slug");
        $check->execute(['slug' => $slug]);
        if ($check->rowCount() > 0) {
            http_response_code(409);
            echo json_encode([
                "status"  => "error",
                "message" => "Slug already exists"
            ]);
            exit;
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "status"  => "error",
            "message" => "SQL Error: " . $e->getMessage()
        ]);
        exit;
    }

    // Insert new Whop, owner_id = user_id
    try {
        $sql = "
          INSERT INTO whops
            (owner_id, user_id, name, slug, description, logo_url, banner_url, price, billing_period, is_recurring, currency)
          VALUES
            (:owner_id, :user_id, :name, :slug, :description, :logo_url, :banner_url, :price, :billing_period, :is_recurring, :currency)
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'owner_id'       => $user_id,
            'user_id'        => $user_id,
            'name'           => $name,
            'slug'           => $slug,
            'description'    => $description,
            'logo_url'       => $logoUrl,
            'banner_url'     => $bannerUrl,
            'price'          => $price,
            'billing_period' => $billing_period,
            'is_recurring'   => $is_recurring,
            'currency'       => $currency
        ]);
        $newId = (int)$pdo->lastInsertId();

        // Insert features if provided
        if (isset($input['features']) && is_array($input['features'])) {
            $featStmt = $pdo->prepare("
                INSERT INTO whop_features (whop_id, title, subtitle, image_url) 
                VALUES (:whop_id, :title, :subtitle, :image_url)
            ");
            foreach ($input['features'] as $feat) {
                $title    = !empty($feat['title'])    ? trim($feat['title'])    : "";
                $subtitle = !empty($feat['subtitle']) ? trim($feat['subtitle']) : "";
                $imageUrl = !empty($feat['imageUrl']) ? trim($feat['imageUrl']) : "";
                if ($title !== "" && $imageUrl !== "") {
                    $featStmt->execute([
                        'whop_id'   => $newId,
                        'title'     => $title,
                        'subtitle'  => $subtitle,
                        'image_url' => $imageUrl
                    ]);
                }
            }
        }

        // Return success response
        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "data"   => [
                "id"             => $newId,
                "owner_id"       => $user_id,
                "name"           => $name,
                "slug"           => $slug,
                "description"    => $description,
                "logo_url"       => $logoUrl,
                "banner_url"     => $bannerUrl,
                "price"          => $price,
                "billing_period" => $billing_period,
                "is_recurring"   => $is_recurring,
                "currency"       => $currency
            ]
        ]);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "status"  => "error",
            "message" => "Database insert failed: " . $e->getMessage()
        ]);
        exit;
    }
} else {
    // Method not allowed
    http_response_code(405);
    echo json_encode([
        "status"  => "error",
        "message" => "Method not allowed"
    ]);
    exit;
}
