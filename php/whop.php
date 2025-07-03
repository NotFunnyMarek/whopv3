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

    // ----- GET detail by slug -----
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
                  w.currency,
                  w.is_recurring,
                  w.billing_period,
                  w.waitlist_enabled,
                  w.waitlist_questions,
                  w.about_bio,
                  w.website_url,
                  w.socials,
                  w.who_for,
                  w.faq,
                  w.created_at
                FROM whops AS w
                JOIN users4 AS u ON w.owner_id = u.id
                WHERE w.slug = :slug
                LIMIT 1
            ";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['slug' => $slug]);
            $w = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$w) {
                http_response_code(404);
                echo json_encode([
                    "status"  => "error",
                    "message" => "Whop not found"
                ]);
                exit;
            }

            // determine roles/status
            $is_owner = ((int)$w['owner_id'] === $user_id) ? 1 : 0;

            $stm = $pdo->prepare("
                SELECT COUNT(*) FROM whop_members
                WHERE user_id = :uid AND whop_id = :wid
            ");
            $stm->execute(['uid' => $user_id, 'wid' => $w['id']]);
            $is_free = ($stm->fetchColumn() > 0) ? 1 : 0;

            $stm = $pdo->prepare("
                SELECT COUNT(*) FROM memberships
                WHERE user_id = :uid AND whop_id = :wid AND status = 'active'
            ");
            $stm->execute(['uid' => $user_id, 'wid' => $w['id']]);
            $is_paid = ($stm->fetchColumn() > 0) ? 1 : 0;

            // count members
            $cntF = $pdo->prepare("SELECT COUNT(*) FROM whop_members WHERE whop_id = :wid");
            $cntF->execute(['wid' => $w['id']]);
            $cntP = $pdo->prepare("SELECT COUNT(*) FROM memberships WHERE whop_id = :wid AND status = 'active'");
            $cntP->execute(['wid' => $w['id']]);
            $members_count = $cntF->fetchColumn() + $cntP->fetchColumn();

            // features
            $fs = $pdo->prepare("
                SELECT title, subtitle, image_url
                FROM whop_features
                WHERE whop_id = :wid
                ORDER BY id
            ");
            $fs->execute(['wid' => $w['id']]);
            $features = $fs->fetchAll(PDO::FETCH_ASSOC);

            // user balance
            $b = $pdo->prepare("SELECT balance FROM users4 WHERE id = :uid LIMIT 1");
            $b->execute(['uid' => $user_id]);
            $user_balance = (float)$b->fetchColumn();

            // waitlist status
            $wl = $pdo->prepare("
                SELECT status, answers_json
                FROM waitlist_requests
                WHERE user_id = :uid AND whop_id = :wid
            ");
            $wl->execute(['uid' => $user_id, 'wid' => $w['id']]);
            $r = $wl->fetch(PDO::FETCH_ASSOC);
            $is_pending_waitlist  = ($r && $r['status'] === 'pending')  ? 1 : 0;
            $is_accepted_waitlist = ($r && $r['status'] === 'accepted') ? 1 : 0;
            $waitlist_answers     = $r['answers_json'] ? json_decode($r['answers_json'], true) : [];

            // respond
            echo json_encode([
                "status" => "success",
                "data"   => [
                    "id"                   => (int)$w['id'],
                    "owner_id"             => (int)$w['owner_id'],
                    "owner_username"       => $w['owner_username'],
                    "name"                 => $w['name'],
                    "slug"                 => $w['slug'],
                    "description"          => $w['description'],
                    "logo_url"             => $w['logo_url'],
                    "banner_url"           => $w['banner_url'],
                    "price"                => (float)$w['price'],
                    "currency"             => $w['currency'],
                    "is_recurring"         => (int)$w['is_recurring'],
                    "billing_period"       => $w['billing_period'],
                    "waitlist_enabled"     => (int)$w['waitlist_enabled'],
                    "waitlist_questions"   => json_decode($w['waitlist_questions'], true) ?: [],
                    "about_bio"            => $w['about_bio'],
                    "website_url"          => $w['website_url'],
                    "socials"              => json_decode($w['socials'], true) ?: new stdClass(),
                    "who_for"              => json_decode($w['who_for'], true)   ?: [],
                    "faq"                  => json_decode($w['faq'], true)       ?: [],
                    "created_at"           => $w['created_at'],
                    "is_owner"             => $is_owner,
                    "is_member_free"       => $is_free,
                    "is_member_paid"       => $is_paid,
                    "is_member"            => ($is_free || $is_paid) ? 1 : 0,
                    "members_count"        => $members_count,
                    "features"             => $features,
                    "user_balance"         => $user_balance,
                    "is_pending_waitlist"  => $is_pending_waitlist,
                    "is_accepted_waitlist" => $is_accepted_waitlist,
                    "waitlist_answers"     => $waitlist_answers
                ]
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

    // ----- GET list of Whops owned by user -----
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

    // Missing GET parameter
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Missing GET parameter 'slug' or 'owner=me'"
    ]);
    exit;

} elseif ($method === 'POST') {
    // ----- POST create new Whop -----
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode([
            "status"  => "error",
            "message" => "Invalid JSON body"
        ]);
        exit;
    }

    // Required fields
    $required = ['name','description','slug','price','billing_period','is_recurring','currency'];
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

    // Extract
    $name             = trim($input['name']);
    $description      = trim($input['description']);
    $slug             = trim($input['slug']);
    $price            = floatval($input['price']);
    $billing_period   = trim($input['billing_period']);
    $is_recurring     = intval($input['is_recurring']);
    $currency         = trim($input['currency']);
    $logoUrl          = !empty($input['logoUrl'])   ? trim($input['logoUrl'])   : "";
    $bannerUrl        = !empty($input['bannerUrl']) ? trim($input['bannerUrl']) : "";
    $waitlist_enabled = intval($input['waitlist_enabled'] ?? 0);
    $waitlist_qs      = isset($input['waitlist_questions'])
                        ? json_encode($input['waitlist_questions'], JSON_UNESCAPED_UNICODE)
                        : json_encode([], JSON_UNESCAPED_UNICODE);
    $about_bio   = trim($input['about_bio']   ?? "");
    $website_url = trim($input['website_url'] ?? "");
    $socials     = isset($input['socials'])
                   ? json_encode($input['socials'], JSON_UNESCAPED_UNICODE)
                   : json_encode(new stdClass(), JSON_UNESCAPED_UNICODE);
    $who_for     = isset($input['who_for'])
                   ? json_encode($input['who_for'], JSON_UNESCAPED_UNICODE)
                   : json_encode([], JSON_UNESCAPED_UNICODE);
    $faq         = isset($input['faq'])
                   ? json_encode($input['faq'], JSON_UNESCAPED_UNICODE)
                   : json_encode([], JSON_UNESCAPED_UNICODE);

    // Slug uniqueness
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

    // Insert
    try {
        $sql = "
          INSERT INTO whops
            (owner_id, user_id, name, slug, description, logo_url, banner_url,
             price, billing_period, is_recurring, currency,
             waitlist_enabled, waitlist_questions,
             about_bio, website_url, socials, who_for, faq)
          VALUES
            (:owner_id, :user_id, :name, :slug, :description, :logo_url, :banner_url,
             :price, :billing_period, :is_recurring, :currency,
             :wlen, :wlq,
             :abt, :web, :soc, :who, :faq)
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
            'currency'       => $currency,
            'wlen'           => $waitlist_enabled,
            'wlq'            => $waitlist_qs,
            'abt'            => $about_bio,
            'web'            => $website_url,
            'soc'            => $socials,
            'who'            => $who_for,
            'faq'            => $faq,
        ]);
        $newId = (int)$pdo->lastInsertId();

        // Insert features
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

        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "data"   => ["id" => $newId, "slug" => $slug]
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
