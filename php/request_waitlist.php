<?php
// php/request_waitlist.php

// ——————————————————————————————————————————————————————————————
// 1) CORS & headers
// ——————————————————————————————————————————————————————————————
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ——————————————————————————————————————————————————————————————
// 2) Session + authentication
// ——————————————————————————————————————————————————————————————
require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "Unauthorized – not logged in"
    ]);
    exit;
}

// ——————————————————————————————————————————————————————————————
// 3) Decode JSON
// ——————————————————————————————————————————————————————————————
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE || !isset($data['whop_id'])) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Missing whop_id or invalid JSON"
    ]);
    exit;
}
$whop_id = (int)$data['whop_id'];

// ——————————————————————————————————————————————————————————————
// 4) Prepare answers_json
// ——————————————————————————————————————————————————————————————
if (isset($data['answers']) && is_array($data['answers'])) {
    // Store exactly what was received (including empty answers)
    $answers_json = json_encode($data['answers'], JSON_UNESCAPED_UNICODE);
} else {
    $answers_json = null;
}

// ——————————————————————————————————————————————————————————————
// 5) DB connection
// ——————————————————————————————————————————————————————————————
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
        "message" => "Connection failed: " . $e->getMessage()
    ]);
    exit;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5a) Check if waitlist_requests has affiliate_link_id column
// ─────────────────────────────────────────────────────────────────────────────
$hasAffColumn = false;
try {
    $chk = $pdo->prepare("SHOW COLUMNS FROM waitlist_requests LIKE 'affiliate_link_id'");
    $chk->execute();
    $hasAffColumn = $chk->rowCount() > 0;
} catch (Exception $e) {
    // If the query fails just assume the column doesn't exist
    $hasAffColumn = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5b) Determine affiliate link ID from cookie if present
// ─────────────────────────────────────────────────────────────────────────────
$affiliate_link_id = null;
if (!empty($_COOKIE['affiliate_code'])) {
    try {
        $aff = $pdo->prepare(
            'SELECT id FROM affiliate_links WHERE code = :c AND whop_id = :wid LIMIT 1'
        );
        $aff->execute(['c' => $_COOKIE['affiliate_code'], 'wid' => $whop_id]);
        $affiliate_link_id = $aff->fetchColumn() ?: null;
    } catch (Exception $e) {
        // ignore failures – treat as no affiliate
    }
}

// ——————————————————————————————————————————————————————————————
// 6) Remove any existing waitlist requests for this user+whop
// ——————————————————————————————————————————————————————————————
try {
    $pdo->prepare("
        DELETE FROM waitlist_requests
        WHERE whop_id = :wid
          AND user_id = :uid
    ")->execute([
        'wid' => $whop_id,
        'uid' => $user_id
    ]);
} catch (PDOException $e) {
    // Log error but continue
    error_log("request_waitlist DELETE old failed: " . $e->getMessage());
}

// ——————————————————————————————————————————————————————————————
// 7) Insert new pending request
// ——————————————————————————————————————————————————————————————
try {
    if ($hasAffColumn) {
        $sql = "
            INSERT INTO waitlist_requests
              (whop_id, user_id, affiliate_link_id, requested_at, status, answers_json)
            VALUES
              (:wid, :uid, :aff, UTC_TIMESTAMP(), 'pending', :aj)
        ";
    } else {
        $sql = "
            INSERT INTO waitlist_requests
              (whop_id, user_id, requested_at, status, answers_json)
            VALUES
              (:wid, :uid, UTC_TIMESTAMP(), 'pending', :aj)
        ";
    }
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':wid', $whop_id, PDO::PARAM_INT);
    $stmt->bindValue(':uid', $user_id, PDO::PARAM_INT);
    if ($hasAffColumn) {
        if ($affiliate_link_id === null) {
            $stmt->bindValue(':aff', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue(':aff', $affiliate_link_id, PDO::PARAM_INT);
        }
    }
    if ($answers_json === null) {
        $stmt->bindValue(':aj', null, PDO::PARAM_NULL);
    } else {
        $stmt->bindValue(':aj', $answers_json, PDO::PARAM_STR);
    }
    $stmt->execute();

    echo json_encode([
        "status"  => "success",
        "message" => "Waitlist request sent — please wait for approval."
    ]);
    exit;
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        http_response_code(409);
        echo json_encode([
            "status"  => "error",
            "message" => "Request already exists"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status"  => "error",
            "message" => "Database error: " . $e->getMessage()
        ]);
    }
    exit;
}
