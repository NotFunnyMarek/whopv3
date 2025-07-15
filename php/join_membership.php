<?php
// php/join_membership.php

// ——————————————————————————————————————————————————————————
// 1) CORS & basic headers
// ——————————————————————————————————————————————————————————
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "Preflight OK"]);
    exit;
}

// ——————————————————————————————————————————————————————————
// 2) Session & authorization
// ——————————————————————————————————————————————————————————
require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized – not logged in"]);
    exit;
}

// ——————————————————————————————————————————————————————————
// 3) Read and decode JSON body
// ——————————————————————————————————————————————————————————
$raw = file_get_contents('php://input');
if (!$raw) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Empty request body"]);
    exit;
}

$data = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON"]);
    exit;
}

// Expecting: whop_id, price, currency, is_recurring, billing_period
if (!isset($data['whop_id'], $data['price'], $data['currency'], $data['is_recurring'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing parameters (whop_id, price, currency, is_recurring)"]);
    exit;
}

$whop_id        = intval($data['whop_id']);
$price          = floatval($data['price']);
$currency       = trim($data['currency']);
$is_recurring   = intval($data['is_recurring']);  // 0 = one-time, 1 = subscription
$billing_period = ($is_recurring === 1 && isset($data['billing_period']))
                  ? trim($data['billing_period'])
                  : null;

// ——————————————————————————————————————————————————————————
// 4) Database connection
// ——————————————————————————————————————————————————————————
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
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]);
    exit;
}

// ——————————————————————————————————————————————————————————
// 5) Verify that the Whop exists & load its owner and settings
// ——————————————————————————————————————————————————————————
try {
    $stmt = $pdo->prepare("
        SELECT owner_id, price AS whop_price, currency AS whop_currency,
               is_recurring AS whop_rec, billing_period AS whop_bp
        FROM whops
        WHERE id = :whop_id
        LIMIT 1
    ");
    $stmt->execute(['whop_id' => $whop_id]);
    $wp = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$wp) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Whop not found"]);
        exit;
    }
    $owner_id         = intval($wp['owner_id']);
    $whop_price_db    = floatval($wp['whop_price']);
    $whop_currency_db = $wp['whop_currency'];
    $whop_rec_db      = intval($wp['whop_rec']);
    $whop_bp_db       = $wp['whop_bp'];
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "SQL Error: " . $e->getMessage()]);
    exit;
}

// ——————————————————————————————————————————————————————————
// 6) Compare submitted parameters with DB (fraud protection)
// ——————————————————————————————————————————————————————————
if (abs($price - $whop_price_db) > 0.001 || $currency !== $whop_currency_db) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid price or currency"]);
    exit;
}
if ($is_recurring !== $whop_rec_db) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid is_recurring value"]);
    exit;
}
if ($is_recurring === 1 && $billing_period !== $whop_bp_db) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid billing_period value"]);
    exit;
}

// ——————————————————————————————————————————————————————————
// 7) Verify user's balance
// ——————————————————————————————————————————————————————————
try {
    $uStmt = $pdo->prepare("SELECT balance FROM users4 WHERE id = :uid LIMIT 1");
    $uStmt->execute(['uid' => $user_id]);
    $uRow = $uStmt->fetch(PDO::FETCH_ASSOC);
    if (!$uRow) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "User not found"]);
        exit;
    }
    $user_balance = floatval($uRow['balance']);
    if ($user_balance < $price) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Insufficient balance"]);
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "SQL Error: " . $e->getMessage()]);
    exit;
}

// ——————————————————————————————————————————————————————————
// 8) Perform transaction: deduct from user, credit owner, insert into memberships & whop_members
// ——————————————————————————————————————————————————————————
try {
    $pdo->beginTransaction();

    // 8a) Deduct from user
    $upd1 = $pdo->prepare("UPDATE users4 SET balance = balance - :price WHERE id = :uid");
    $upd1->execute(['price' => $price, 'uid' => $user_id]);

    $affiliate_amount = 0;
    if (!empty($_COOKIE['affiliate_code'])) {
        $affStmt = $pdo->prepare(
            "SELECT id, user_id, payout_percent FROM affiliate_links WHERE code=:c AND whop_id=:wid LIMIT 1"
        );
        $affStmt->execute(['c' => $_COOKIE['affiliate_code'], 'wid' => $whop_id]);
        $affRow = $affStmt->fetch(PDO::FETCH_ASSOC);
        if ($affRow) {
            $affiliate_amount = $price * (floatval($affRow['payout_percent']) / 100.0);
            $affUpd = $pdo->prepare("UPDATE users4 SET balance = balance + :amt WHERE id = :aid");
            $affUpd->execute(['amt' => $affiliate_amount, 'aid' => (int)$affRow['user_id']]);
            $affInc = $pdo->prepare("UPDATE affiliate_links SET signups = signups + 1 WHERE id = :id");
            $affInc->execute(['id' => (int)$affRow['id']]);

            $affPay = $pdo->prepare(
                "INSERT INTO payments (user_id, whop_id, amount, currency, payment_date, type)
                 VALUES (:uid, :wid, :amt, :curr, UTC_TIMESTAMP(), 'payout')"
            );
            $affPay->execute([
                'uid'  => (int)$affRow['user_id'],
                'wid'  => $whop_id,
                'amt'  => $affiliate_amount,
                'curr' => $currency
            ]);
        }
    }

    // 8b) Credit Whop owner
    $owner_amount = $price - $affiliate_amount;
    $upd2 = $pdo->prepare("UPDATE users4 SET balance = balance + :price WHERE id = :owner_id");
    $upd2->execute(['price' => $owner_amount, 'owner_id' => $owner_id]);

    // 8c) Compute start_time, end_time, next_payment_date
    $now = new DateTime("now", new DateTimeZone("UTC"));
    $start_str = $now->format("Y-m-d H:i:s");
    $end = clone $now;

    if ($is_recurring === 1) {
        switch ($billing_period) {
            case '1min':
                $end->modify("+1 minute");
                break;
            case '7days':
                $end->modify("+7 days");
                break;
            case '14days':
                $end->modify("+14 days");
                break;
            case '30days':
                $end->modify("+30 days");
                break;
            case '1year':
                $end->modify("+1 year");
                break;
            default:
                throw new Exception("Unknown billing_period");
        }
        $next_payment = clone $end;
        $next_payment_str = $next_payment->format("Y-m-d H:i:s");
    } else {
        // One-time → end_time is now (immediate expiration)
        // next_payment_date remains NULL
        $next_payment_str = null;
    }

    $end_str = $end->format("Y-m-d H:i:s");

    // 8d) Insert into memberships
    $ins = $pdo->prepare("
        INSERT INTO memberships
          (user_id, whop_id, price, currency, is_recurring, billing_period, start_time, end_time, next_payment_date, is_active)
        VALUES
          (:uid, :wid, :price, :currency, :is_rec, :bp, :start_t, :end_t, :next_p, 1)
    ");
    $ins->execute([
        'uid'      => $user_id,
        'wid'      => $whop_id,
        'price'    => $price,
        'currency' => $currency,
        'is_rec'   => $is_recurring,
        'bp'       => $billing_period,
        'start_t'  => $start_str,
        'end_t'    => $end_str,
        'next_p'   => $next_payment_str
    ]);

    // 8e) Insert into whop_members if not already present
    $exists = $pdo->prepare("
        SELECT 1 FROM whop_members
        WHERE user_id = :uid AND whop_id = :wid
        LIMIT 1
    ");
    $exists->execute(['uid' => $user_id, 'wid' => $whop_id]);
    if (!$exists->fetch()) {
        $ins2 = $pdo->prepare("INSERT INTO whop_members (user_id, whop_id) VALUES (:uid, :wid)");
        $ins2->execute(['uid' => $user_id, 'wid' => $whop_id]);
        $hist = $pdo->prepare("INSERT IGNORE INTO whop_member_history (user_id, whop_id, joined_at) VALUES (:uid, :wid, :joined_at)");
        $hist->execute(['uid' => $user_id, 'wid' => $whop_id, 'joined_at' => $start_str]);
    }

    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "Membership successfully activated"]);
    exit;
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error processing payment: " . $e->getMessage()]);
    exit;
}
