<?php
// =========================================
// File: php/submissions.php
// =========================================

// 1) CORS – allow requests from React on localhost:3000 and production
$allowed_origins = [
    'http://localhost:3000',
    'https://app.byxbot.com'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json; charset=UTF-8");

// 2) Authentication
require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "Unauthorized"
    ]);
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
    echo json_encode([
        "status"  => "error",
        "message" => "DB connection failed"
    ]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Return this user's submissions (optionally filtered by campaign_id)
        $campaign_id = isset($_GET['campaign_id']) ? intval($_GET['campaign_id']) : null;
        $sql = "
            SELECT
              s.id,
              s.campaign_id,
              c.campaign_name,
              s.link,
              s.media_url,
              s.status,
              s.total_views,
              s.rejection_reason,
              s.created_at,
              s.updated_at
            FROM submissions AS s
            JOIN campaign AS c ON s.campaign_id = c.id
            WHERE s.user_id = :uid
        ";
        $params = ['uid' => $user_id];
        if ($campaign_id) {
            $sql .= " AND s.campaign_id = :cid";
            $params['cid'] = $campaign_id;
        }
        $sql .= " ORDER BY s.created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode([
            "status" => "success",
            "data"   => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
        exit;
    }

    if ($method === 'POST') {
        // Read and validate input
        $input = json_decode(file_get_contents('php://input'), true);
        if (
            !$input ||
            !isset($input['campaign_id'], $input['link'], $input['platform'], $input['owner'])
        ) {
            http_response_code(400);
            echo json_encode([
                "status"  => "error",
                "message" => "Missing fields"
            ]);
            exit;
        }

        $campaign_id = intval($input['campaign_id']);
        $link        = trim($input['link']);
        $platform    = $input['platform'];
        $owner       = trim($input['owner']);

        if ($link === "") {
            http_response_code(400);
            echo json_encode([
                "status"  => "error",
                "message" => "Empty link"
            ]);
            exit;
        }

        // 4) Does the campaign exist?
        $checkCampaign = $pdo->prepare("
            SELECT id
              FROM campaign
             WHERE id = :cid
             LIMIT 1
        ");
        $checkCampaign->execute(['cid' => $campaign_id]);
        if (!$checkCampaign->rowCount()) {
            http_response_code(404);
            echo json_encode([
                "status"  => "error",
                "message" => "Campaign not found"
            ]);
            exit;
        }

        // 5) Duplicate submission?
        $dupCheck = $pdo->prepare("
            SELECT id
              FROM submissions
             WHERE user_id = :uid
               AND campaign_id = :cid
               AND link = :link
             LIMIT 1
        ");
        $dupCheck->execute([
            'uid'  => $user_id,
            'cid'  => $campaign_id,
            'link' => $link
        ]);
        if ($dupCheck->rowCount()) {
            http_response_code(409);
            echo json_encode([
                "status"  => "error",
                "message" => "Already submitted"
            ]);
            exit;
        }

        // 6) Build account URL based on platform and owner
        switch ($platform) {
            case 'instagram':
                $accountUrl = "https://www.instagram.com/{$owner}/";
                break;
            case 'tiktok':
                $accountUrl = "https://www.tiktok.com/@{$owner}";
                break;
            case 'youtube':
                $accountUrl = "https://www.youtube.com/@{$owner}";
                break;
            default:
                http_response_code(400);
                echo json_encode([
                    "status"  => "error",
                    "message" => "Unsupported platform"
                ]);
                exit;
        }

        // 7) Verify that the account is linked and verified
        $verifyAccount = $pdo->prepare("
            SELECT id
              FROM linked_accounts
             WHERE user_id     = :uid
               AND platform    = :plat
               AND account_url = :url
               AND is_verified = 1
             LIMIT 1
        ");
        $verifyAccount->execute([
            'uid'  => $user_id,
            'plat' => $platform,
            'url'  => $accountUrl
        ]);
        if (!$verifyAccount->rowCount()) {
            http_response_code(403);
            echo json_encode([
                "status"  => "error",
                "message" => "This {$platform} account is not linked & verified."
            ]);
            exit;
        }

        // 8) Insert new submission
        $insert = $pdo->prepare("
            INSERT INTO submissions
              (user_id, campaign_id, link, media_url, status, total_views, rejection_reason)
            VALUES
              (:uid, :cid, :link, '', 'pending', 0, NULL)
        ");
        $insert->execute([
            'uid'  => $user_id,
            'cid'  => $campaign_id,
            'link' => $link
        ]);
        $newId = $pdo->lastInsertId();

        // 9) Return the newly created record
        $fetchNew = $pdo->prepare("
            SELECT
              s.id,
              s.campaign_id,
              c.campaign_name,
              s.link,
              s.media_url,
              s.status,
              s.total_views,
              s.rejection_reason,
              s.created_at,
              s.updated_at
            FROM submissions AS s
            JOIN campaign AS c ON s.campaign_id = c.id
            WHERE s.id = :id
            LIMIT 1
        ");
        $fetchNew->execute(['id' => $newId]);
        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "data"   => $fetchNew->fetch(PDO::FETCH_ASSOC)
        ]);
        exit;
    }

    // Method not allowed
    http_response_code(405);
    echo json_encode([
        "status"  => "error",
        "message" => "Method not allowed"
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Server error"
    ]);
    exit;
}
