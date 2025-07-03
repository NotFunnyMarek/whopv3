<?php
// php/get_whop.php

// =========================================
// 0) CORS & headers (must be at the very top)
// =========================================
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Preflight CORS request
    http_response_code(200);
    exit;
}

// =========================================
// 1) Session & user authentication
// =========================================
session_start();
$user_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
if ($user_id <= 0) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "Unauthorized – you are not logged in"
    ]);
    exit;
}

// =========================================
// 2) Database connection
// =========================================
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

// =========================================
// 3) Process recurring payments
//    (unchanged from before, keep as is)
// =========================================
try {
    $stmt = $pdo->prepare("
        SELECT
            m.id AS membership_id,
            m.user_id,
            m.whop_id,
            m.price,
            m.currency,
            m.billing_period,
            m.next_payment_at,
            w.owner_id
        FROM memberships AS m
        JOIN whops AS w ON m.whop_id = w.id
        WHERE
            m.status = 'active'
            AND m.is_recurring = 1
            AND m.next_payment_at <= UTC_TIMESTAMP()
    ");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as $r) {
        $mid   = (int)$r['membership_id'];
        $uid   = (int)$r['user_id'];
        $wid   = (int)$r['whop_id'];
        $amt   = (float)$r['price'];
        $curr  = $r['currency'];
        $bper  = $r['billing_period'];
        $oid   = (int)$r['owner_id'];
        $when  = $r['next_payment_at'];

        // check user balance
        $u = $pdo->prepare("SELECT balance FROM users4 WHERE id = :uid LIMIT 1");
        $u->execute(['uid' => $uid]);
        $bal = $u->fetchColumn();
        if ($bal === false || (float)$bal < $amt) {
            $pdo->prepare("
                UPDATE memberships
                SET status = 'canceled', next_payment_at = NULL
                WHERE id = :mid
            ")->execute(['mid' => $mid]);
            continue;
        }

        // transaction
        try {
            $pdo->beginTransaction();

            $pdo->prepare("UPDATE users4 SET balance = balance - :amt WHERE id = :uid")
                ->execute(['amt' => $amt, 'uid' => $uid]);
            $pdo->prepare("UPDATE users4 SET balance = balance + :amt WHERE id = :oid")
                ->execute(['amt' => $amt, 'oid' => $oid]);

            $pdo->prepare("
                INSERT INTO payments
                  (user_id, whop_id, amount, currency, payment_date, type)
                VALUES
                  (:uid, :wid, :amt, :curr, :pd, 'recurring')
            ")->execute([
                'uid'  => $uid,
                'wid'  => $wid,
                'amt'  => $amt,
                'curr' => $curr,
                'pd'   => $when
            ]);

            $dt = new DateTime($when, new DateTimeZone('UTC'));
            if (preg_match('/^(\d+)\s*(min(ute)?s?)$/i', $bper, $m)) {
                $dt->add(new DateInterval("PT{$m[1]}M"));
            } elseif (preg_match('/^(\d+)\s*(day|days)$/i', $bper, $m)) {
                $dt->add(new DateInterval("P{$m[1]}D"));
            } elseif (preg_match('/^(\d+)\s*(year|years)$/i', $bper, $m)) {
                $dt->add(new DateInterval("P{$m[1]}Y"));
            } else {
                $dt->add(new DateInterval("P30D"));
            }

            $pdo->prepare("
                UPDATE memberships
                SET next_payment_at = :nn
                WHERE id = :mid
            ")->execute([
                'nn'  => $dt->format('Y-m-d H:i:s'),
                'mid' => $mid
            ]);

            $pdo->commit();
        } catch (Exception $ex) {
            $pdo->rollBack();
            error_log("Recurring payment error: " . $ex->getMessage());
        }
    }
} catch (Exception $e) {
    error_log("Recurring processing error: " . $e->getMessage());
}

// =========================================
// 4) Route GET and POST
// =========================================
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {

    // ----- detail by slug -----
    if (isset($_GET['slug'])) {
        $slug = trim($_GET['slug']);
        try {
            $q = $pdo->prepare("
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
            ");
            $q->execute(['slug' => $slug]);
            $w = $q->fetch(PDO::FETCH_ASSOC);

            if (!$w) {
                http_response_code(404);
                echo json_encode([
                    "status"  => "error",
                    "message" => "Whop not found"
                ]);
                exit;
            }

            // determine roles and statuses
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

            // respond with data
            echo json_encode([
                "status" => "success",
                "data"   => [
                    "id"                     => (int)$w['id'],
                    "owner_id"               => (int)$w['owner_id'],
                    "owner_username"         => $w['owner_username'],
                    "name"                   => $w['name'],
                    "slug"                   => $w['slug'],
                    "description"            => $w['description'],
                    "logo_url"               => $w['logo_url'],
                    "banner_url"             => $w['banner_url'],
                    "price"                  => (float)$w['price'],
                    "currency"               => $w['currency'],
                    "is_recurring"           => (int)$w['is_recurring'],
                    "billing_period"         => $w['billing_period'],
                    "waitlist_enabled"       => (int)$w['waitlist_enabled'],
                    "waitlist_questions"     => json_decode($w['waitlist_questions'], true) ?: [],
                    "about_bio"              => $w['about_bio'],
                    "website_url"            => $w['website_url'],
                    "socials"                => json_decode($w['socials'], true) ?: new stdClass(),
                    "who_for"                => json_decode($w['who_for'], true)   ?: [],
                    "faq"                    => json_decode($w['faq'], true)       ?: [],
                    "created_at"             => $w['created_at'],
                    "is_owner"               => $is_owner,
                    "is_member_free"         => $is_free,
                    "is_member_paid"         => $is_paid,
                    "is_member"              => ($is_free || $is_paid) ? 1 : 0,
                    "members_count"          => $members_count,
                    "features"               => $features,
                    "user_balance"           => $user_balance,
                    "is_pending_waitlist"    => $is_pending_waitlist,
                    "is_accepted_waitlist"   => $is_accepted_waitlist,
                    "waitlist_answers"       => $waitlist_answers
                ]
            ]);
            exit;
        } catch (PDOException $ex) {
            http_response_code(500);
            echo json_encode([
                "status"  => "error",
                "message" => "SQL Error: " . $ex->getMessage()
            ]);
            exit;
        }
    }

    // ----- list whops owned by the user -----
    if (isset($_GET['owner']) && $_GET['owner'] === 'me') {
        try {
            $q2 = $pdo->prepare("
                SELECT
                    id, name, slug, description,
                    logo_url, banner_url,
                    price, currency,
                    is_recurring, billing_period,
                    created_at
                FROM whops
                WHERE owner_id = :uid
                ORDER BY created_at DESC
            ");
            $q2->execute(['uid' => $user_id]);
            $rows = $q2->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "status" => "success",
                "data"   => $rows
            ]);
            exit;
        } catch (PDOException $ex) {
            http_response_code(500);
            echo json_encode([
                "status"  => "error",
                "message" => "SQL Error: " . $ex->getMessage()
            ]);
            exit;
        }
    }

    // ----- missing parameter -----
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Missing GET parameter 'slug' or 'owner=me'"
    ]);
    exit;

} elseif ($method === 'POST') {
    // POST not supported here
    http_response_code(405);
    echo json_encode([
        "status"  => "error",
        "message" => "Method not allowed"
    ]);
    exit;
} else {
    // unsupported method
    http_response_code(405);
    echo json_encode([
        "status"  => "error",
        "message" => "Method not allowed"
    ]);
    exit;
}
