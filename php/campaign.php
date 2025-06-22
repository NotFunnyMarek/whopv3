<?php
// php/campaign.php

// 1) CORS & headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2) Session & authentication
session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized – not logged in"]);
    exit;
}

// 3) Database connection
require_once __DIR__ . '/config_login.php';
try {
    $pdo = new PDO(
        "mysql:host={$servername};dbname={$database};charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    exit;
}

// Helper: automatically expire campaigns whose expiration_datetime has passed
function autoExpireAllCampaigns(PDO $pdo) {
    $stmtExpired = $pdo->query("
        SELECT id, user_id, budget, paid_out
        FROM campaign
        WHERE is_active = 1
          AND expiration_datetime <= NOW()
    ");
    $expiredList = $stmtExpired->fetchAll(PDO::FETCH_ASSOC);
    if (!$expiredList) {
        return;
    }
    try {
        $pdo->beginTransaction();
        foreach ($expiredList as $camp) {
            $campId    = (int)$camp['id'];
            $ownerId   = (int)$camp['user_id'];
            $budget    = (float)$camp['budget'];
            $paidOut   = (float)$camp['paid_out'];
            $refundAmt = $budget - $paidOut;
            // Deactivate campaign
            $pdo->prepare("
                UPDATE campaign
                SET is_active = 0
                WHERE id = :campId
            ")->execute(['campId' => $campId]);
            // Reject pending or approved submissions
            $pdo->prepare("
                UPDATE submissions
                SET status = 'rejected',
                    rejection_reason = 'Campaign Expired'
                WHERE campaign_id = :campId
                  AND (status = 'pending' OR status = 'approved')
            ")->execute(['campId' => $campId]);
            // Refund remaining budget
            if ($refundAmt > 0) {
                $pdo->prepare("
                    UPDATE users4
                    SET balance = balance + :refundAmt
                    WHERE id = :ownerId
                ")->execute([
                    'refundAmt' => $refundAmt,
                    'ownerId'   => $ownerId
                ]);
            }
        }
        $pdo->commit();
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("autoExpireAllCampaigns ERROR: " . $e->getMessage());
    }
}

// Call auto-expire before handling any GET
autoExpireAllCampaigns($pdo);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // 1a) GET without whop_id: return all campaigns
    if (!isset($_GET['whop_id'])) {
        try {
            $sql = "
                SELECT
                  c.id,
                  c.user_id,
                  u.username,
                  c.whop_id,
                  w.slug       AS whop_slug,
                  c.campaign_name,
                  c.category,
                  c.type,
                  c.budget,
                  c.currency,
                  c.reward_per_thousand,
                  c.min_payout,
                  c.max_payout,
                  c.platforms,
                  c.thumbnail_url,
                  c.content_links,
                  c.requirements,
                  c.paid_out,
                  c.total_paid_out,
                  c.paid_percent,
                  c.is_active,
                  c.expiration_datetime,
                  c.created_at,
                  c.updated_at
                FROM campaign AS c
                JOIN users4   AS u ON c.user_id = u.id
                JOIN whops    AS w ON c.whop_id = w.id
                ORDER BY c.created_at DESC
            ";
            $rows = $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            $result = array_map(function($row) {
                return [
                    "id"                  => (int)$row["id"],
                    "user_id"             => (int)$row["user_id"],
                    "username"            => $row["username"],
                    "whop_id"             => (int)$row["whop_id"],
                    "whop_slug"           => $row["whop_slug"],
                    "campaign_name"       => $row["campaign_name"],
                    "category"            => $row["category"],
                    "type"                => $row["type"],
                    "budget"              => (float)$row["budget"],
                    "currency"            => $row["currency"],
                    "reward_per_thousand" => (float)$row["reward_per_thousand"],
                    "min_payout"          => $row["min_payout"] !== null ? (float)$row["min_payout"] : null,
                    "max_payout"          => $row["max_payout"] !== null ? (float)$row["max_payout"] : null,
                    "platforms"           => json_decode($row["platforms"], true) ?: [],
                    "thumbnail_url"       => $row["thumbnail_url"],
                    "content_links"       => json_decode($row["content_links"], true) ?: [],
                    "requirements"        => json_decode($row["requirements"], true) ?: [],
                    "paid_out"            => (float)$row["paid_out"],
                    "total_paid_out"      => (float)$row["total_paid_out"],
                    "paid_percent"        => (int)$row["paid_percent"],
                    "is_active"           => (int)$row["is_active"],
                    "expiration_datetime" => $row["expiration_datetime"],
                    "created_at"          => $row["created_at"],
                    "updated_at"          => $row["updated_at"]
                ];
            }, $rows);
            echo json_encode($result);
            exit;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "SQL Error: " . $e->getMessage()]);
            exit;
        }
    }

    // 1b) GET with whop_id: return campaigns for that Whop
    $whop_id = intval($_GET['whop_id']);
    try {
        // Validate Whop exists
        $checkWhop = $pdo->prepare("SELECT id, slug FROM whops WHERE id = :whop_id");
        $checkWhop->execute(['whop_id' => $whop_id]);
        $whopRow = $checkWhop->fetch(PDO::FETCH_ASSOC);
        if (!$whopRow) {
            http_response_code(404);
            echo json_encode(["error" => "Whop not found"]);
            exit;
        }
        $currentSlug = $whopRow['slug'];

        $sql = "
            SELECT
              c.id,
              c.user_id,
              u.username,
              c.whop_id,
              :whop_slug AS whop_slug,
              c.campaign_name,
              c.category,
              c.type,
              c.budget,
              c.currency,
              c.reward_per_thousand,
              c.min_payout,
              c.max_payout,
              c.platforms,
              c.thumbnail_url,
              c.content_links,
              c.requirements,
              c.paid_out,
              c.total_paid_out,
              c.paid_percent,
              c.is_active,
              c.expiration_datetime,
              c.created_at,
              c.updated_at
            FROM campaign AS c
            JOIN users4   AS u ON c.user_id = u.id
           WHERE c.whop_id = :whop_id
           ORDER BY c.created_at DESC
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'whop_id'   => $whop_id,
            'whop_slug' => $currentSlug
        ]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $result = array_map(function($row) {
            return [
                "id"                  => (int)$row["id"],
                "user_id"             => (int)$row["user_id"],
                "username"            => $row["username"],
                "whop_id"             => (int)$row["whop_id"],
                "whop_slug"           => $row["whop_slug"],
                "campaign_name"       => $row["campaign_name"],
                "category"            => $row["category"],
                "type"                => $row["type"],
                "budget"              => (float)$row["budget"],
                "currency"            => $row["currency"],
                "reward_per_thousand" => (float)$row["reward_per_thousand"],
                "min_payout"          => $row["min_payout"] !== null ? (float)$row["min_payout"] : null,
                "max_payout"          => $row["max_payout"] !== null ? (float)$row["max_payout"] : null,
                "platforms"           => json_decode($row["platforms"], true) ?: [],
                "thumbnail_url"       => $row["thumbnail_url"],
                "content_links"       => json_decode($row["content_links"], true) ?: [],
                "requirements"        => json_decode($row["requirements"], true) ?: [],
                "paid_out"            => (float)$row["paid_out"],
                "total_paid_out"      => (float)$row["total_paid_out"],
                "paid_percent"        => (int)$row["paid_percent"],
                "is_active"           => (int)$row["is_active"],
                "expiration_datetime" => $row["expiration_datetime"],
                "created_at"          => $row["created_at"],
                "updated_at"          => $row["updated_at"]
            ];
        }, $rows);
        echo json_encode($result);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "SQL Error: " . $e->getMessage()]);
        exit;
    }
}
elseif ($method === 'POST') {
    // 2) Parse POST JSON body
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON body"]);
        exit;
    }

    // Required fields
    $required = [
        'whop_id',
        'campaign_name',
        'category',
        'type',
        'budget',
        'currency',
        'reward_per_thousand',
        'expiration_datetime'
    ];
    foreach ($required as $field) {
        if (!isset($input[$field]) || trim((string)$input[$field]) === '') {
            http_response_code(400);
            echo json_encode(["error" => "Missing field '$field'"]);
            exit;
        }
    }

    // Extract and sanitize inputs
    $whop_id             = intval($input['whop_id']);
    $campaign_name       = trim($input['campaign_name']);
    $category            = trim($input['category']);
    $type                = trim($input['type']);
    $budget              = floatval($input['budget']);
    $currency            = trim($input['currency']);
    $reward_per_thousand = floatval($input['reward_per_thousand']);
    $min_payout          = isset($input['min_payout']) && $input['min_payout'] !== '' ? floatval($input['min_payout']) : null;
    $max_payout          = isset($input['max_payout']) && $input['max_payout'] !== '' ? floatval($input['max_payout']) : null;
    $platforms           = is_array($input['platforms']) ? json_encode($input['platforms'], JSON_UNESCAPED_UNICODE) : '[]';
    $thumbnail_url       = !empty($input['thumbnail_url']) ? trim($input['thumbnail_url']) : null;
    $content_links       = is_array($input['content_links']) ? json_encode($input['content_links'], JSON_UNESCAPED_UNICODE) : '[]';
    $requirements        = is_array($input['requirements']) ? json_encode($input['requirements'], JSON_UNESCAPED_UNICODE) : '[]';

    // Validate expiration_datetime format
    $expiration_datetime = trim($input['expiration_datetime']);
    $dt = DateTime::createFromFormat('Y-m-d H:i:s', $expiration_datetime);
    if (!$dt || $dt->format('Y-m-d H:i:s') !== $expiration_datetime) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid expiration_datetime format, expected YYYY-MM-DD HH:MM:SS"]);
        exit;
    }

    // 3) Verify user balance
    try {
        $balStmt = $pdo->prepare("
            SELECT balance
            FROM users4
            WHERE id = :user_id
            LIMIT 1
        ");
        $balStmt->execute(['user_id' => $user_id]);
        $balRow = $balStmt->fetch(PDO::FETCH_ASSOC);
        if (!$balRow) {
            http_response_code(404);
            echo json_encode(["error" => "User not found"]);
            exit;
        }
        $currentBalance = floatval($balRow['balance']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "SQL Error: " . $e->getMessage()]);
        exit;
    }

    if ($currentBalance < $budget) {
        http_response_code(400);
        echo json_encode([
            "error" => "Insufficient balance, need {$currency}{$budget}, have {$currency}" . number_format($currentBalance, 2)
        ]);
        exit;
    }

    // 4) Verify Whop exists
    try {
        $check = $pdo->prepare("SELECT id FROM whops WHERE id = :whop_id");
        $check->execute(['whop_id' => $whop_id]);
        if (!$check->fetch(PDO::FETCH_ASSOC)) {
            http_response_code(404);
            echo json_encode(["error" => "Whop not found"]);
            exit;
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "SQL Error: " . $e->getMessage()]);
        exit;
    }

    // 5) Insert campaign and deduct budget
    try {
        $pdo->beginTransaction();

        // Deduct budget from user balance
        $pdo->prepare("
            UPDATE users4
            SET balance = balance - :budget
            WHERE id = :user_id
        ")->execute([
            'budget'  => $budget,
            'user_id' => $user_id
        ]);

        // Insert campaign
        $sql = "
          INSERT INTO campaign
            (user_id, whop_id, campaign_name, category, `type`, budget, currency, reward_per_thousand,
             min_payout, max_payout, platforms, thumbnail_url, content_links, requirements,
             paid_out, total_paid_out, paid_percent, is_active, expiration_datetime)
          VALUES
            (:user_id, :whop_id, :campaign_name, :category, :type, :budget, :currency, :reward_per_thousand,
             :min_payout, :max_payout, :platforms, :thumbnail_url, :content_links, :requirements,
             0.00, :budget, 0, 1, :expiration_datetime)
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'user_id'             => $user_id,
            'whop_id'             => $whop_id,
            'campaign_name'       => $campaign_name,
            'category'            => $category,
            'type'                => $type,
            'budget'              => $budget,
            'currency'            => $currency,
            'reward_per_thousand' => $reward_per_thousand,
            'min_payout'          => $min_payout,
            'max_payout'          => $max_payout,
            'platforms'           => $platforms,
            'thumbnail_url'       => $thumbnail_url,
            'content_links'       => $content_links,
            'requirements'        => $requirements,
            'expiration_datetime' => $expiration_datetime
        ]);
        $newId = (int)$pdo->lastInsertId();

        $pdo->commit();
        http_response_code(201);
        echo json_encode(["success" => true, "id" => $newId]);
        exit;
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Database insert failed: " . $e->getMessage()]);
        exit;
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}
