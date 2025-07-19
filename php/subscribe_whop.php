<?php
// =========================================
// File: php/subscribe_whop.php
// =========================================

// 1) CORS & headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2) Session & user authentication
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

// 3) Read input JSON
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['whop_id'])) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Missing whop_id"
    ]);
    exit;
}
$whopId = intval($input['whop_id']);
$planId = isset($input['plan_id']) ? intval($input['plan_id']) : null;

// 4) Database connection
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

// 5) Check if user is banned from this Whop
try {
    $banStmt = $pdo->prepare("
        SELECT 1
          FROM whop_bans
         WHERE whop_id = :whop_id
           AND user_id = :user_id
         LIMIT 1
    ");
    $banStmt->execute([
        'whop_id' => $whopId,
        'user_id' => $user_id
    ]);
    if ($banStmt->fetch()) {
        http_response_code(403);
        echo json_encode([
            "status"  => "error",
            "message" => "You have been banned from this Whop."
        ]);
        exit;
    }
} catch (PDOException $e) {
    // Log error but allow process to continue
    error_log("subscribe_whop ban-check error: " . $e->getMessage());
}

// 6) Fetch Whop parameters
try {
    $stmt = $pdo->prepare(
        "SELECT owner_id, price, currency, is_recurring, billing_period FROM whops WHERE id = :whop_id LIMIT 1"
    );
    $stmt->execute(['whop_id' => $whopId]);
    $whop = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$whop) {
        http_response_code(404);
        echo json_encode([
            "status"  => "error",
            "message" => "Whop not found"
        ]);
        exit;
    }

    if ($planId) {
        $p = $pdo->prepare("SELECT price, currency, billing_period FROM whop_pricing_plans WHERE id = :pid AND whop_id = :wid LIMIT 1");
        $p->execute(['pid' => $planId, 'wid' => $whopId]);
        $plan = $p->fetch(PDO::FETCH_ASSOC);
        if (!$plan) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid plan_id"]);
            exit;
        }
        $whop['price'] = $plan['price'];
        $whop['currency'] = $plan['currency'];
        $whop['billing_period'] = $plan['billing_period'];
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error fetching Whop: " . $e->getMessage()
    ]);
    exit;
}

$owner_id       = intval($whop['owner_id']);
$price          = floatval($whop['price']);
$currency       = trim($whop['currency']);
$is_recurring   = intval($whop['is_recurring']);
$billing_period = trim($whop['billing_period']);

// 7) Check user balance
try {
    $balStmt = $pdo->prepare("
        SELECT balance
          FROM users4
         WHERE id = :user_id
         LIMIT 1
    ");
    $balStmt->execute(['user_id' => $user_id]);
    $row = $balStmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(500);
        echo json_encode([
            "status"  => "error",
            "message" => "User not found"
        ]);
        exit;
    }
    $userBalance = floatval($row['balance']);
    if ($userBalance < $price) {
        http_response_code(400);
        echo json_encode([
            "status"  => "error",
            "message" => "Insufficient balance"
        ]);
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error checking balance: " . $e->getMessage()
    ]);
    exit;
}

// 8) Check for existing active membership
try {
    $checkStmt = $pdo->prepare("
      SELECT id, status
        FROM memberships
       WHERE user_id = :user_id
         AND whop_id = :whop_id
       LIMIT 1
    ");
    $checkStmt->execute([
        'user_id' => $user_id,
        'whop_id' => $whopId
    ]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
    if ($existing && $existing['status'] === 'active') {
        http_response_code(409);
        echo json_encode([
            "status"  => "error",
            "message" => "You already have an active membership"
        ]);
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error checking membership: " . $e->getMessage()
    ]);
    exit;
}

// 9) Perform transaction: deduct from user, credit owner, create membership & payment
try {
    $pdo->beginTransaction();

    // a) Deduct from user
    $updUserStmt = $pdo->prepare("
      UPDATE users4 
         SET balance = balance - :price 
       WHERE id = :user_id
    ");
    $updUserStmt->execute([
        'price'   => $price,
        'user_id' => $user_id
    ]);

    // b) Handle affiliate payout if cookie is set
    $affiliate_amount = 0.0;
    $affiliate_link_id = null;
    if (!empty($_COOKIE['affiliate_code'])) {
        $affStmt = $pdo->prepare(
            'SELECT id, user_id, payout_percent, payout_recurring FROM affiliate_links WHERE code=:c AND whop_id=:wid LIMIT 1'
        );
        $affStmt->execute([
            'c'   => $_COOKIE['affiliate_code'],
            'wid' => $whopId
        ]);
        $affRow = $affStmt->fetch(PDO::FETCH_ASSOC);
        if ($affRow) {
            $affiliate_link_id = (int)$affRow['id'];
            $affiliate_amount = $price * (floatval($affRow['payout_percent']) / 100.0);
            $affUpd = $pdo->prepare('UPDATE users4 SET balance = balance + :amt WHERE id = :aid');
            $affUpd->execute([
                'amt' => $affiliate_amount,
                'aid' => (int)$affRow['user_id']
            ]);
            $affInc = $pdo->prepare('UPDATE affiliate_links SET signups = signups + 1 WHERE id = :id');
            $affInc->execute(['id' => (int)$affRow['id']]);

            // Record the affiliate payout
            $affPay = $pdo->prepare(
                'INSERT INTO payments (user_id, whop_id, amount, currency, payment_date, type)
                 VALUES (:uid, :wid, :amt, :curr, UTC_TIMESTAMP(), "payout")'
            );
            $affPay->execute([
                'uid'  => (int)$affRow['user_id'],
                'wid'  => $whopId,
                'amt'  => $affiliate_amount,
                'curr' => $currency
            ]);
        }
    }

    // c) Credit owner with remaining amount
    $owner_amount = $price - $affiliate_amount;
    $updOwnerStmt = $pdo->prepare("
        UPDATE users4
           SET balance = balance + :price
         WHERE id = :owner_id
    ");
    $updOwnerStmt->execute([
        'price'    => $owner_amount,
        'owner_id' => $owner_id
    ]);

    // d) Calculate start_at and next_payment_at if recurring
    $now = new DateTime('now', new DateTimeZone('UTC'));
    $startAt = $now->format('Y-m-d H:i:s');
    if ($is_recurring === 1) {
        // Determine interval
        if (preg_match('/^(\d+)\s*min/i', $billing_period, $m)) {
            $interval = new DateInterval("PT{$m[1]}M");
        } elseif (preg_match('/^(\d+)\s*day/i', $billing_period, $m)) {
            $interval = new DateInterval("P{$m[1]}D");
        } elseif (preg_match('/^(\d+)\s*year/i', $billing_period, $m)) {
            $interval = new DateInterval("P{$m[1]}Y");
        } else {
            $interval = new DateInterval("P30D");
        }
        $nextDate      = (new DateTime($startAt))->add($interval);
        $nextPaymentAt = $nextDate->format('Y-m-d H:i:s');
    } else {
        $nextPaymentAt = null;
    }

    // e) Insert into memberships
    $insertStmt = $pdo->prepare("
      INSERT INTO memberships
        (user_id, whop_id, price, currency, is_recurring, billing_period, start_at, next_payment_at, affiliate_link_id, status)
      VALUES
        (:user_id, :whop_id, :price, :currency, :is_recurring, :billing_period, :start_at, :next_payment_at, :aff_link, 'active')
    ");
    $insertStmt->execute([
        'user_id'         => $user_id,
        'whop_id'         => $whopId,
        'price'           => $price,
        'currency'        => $currency,
        'is_recurring'    => $is_recurring,
        'billing_period'  => $billing_period,
        'start_at'        => $startAt,
        'next_payment_at' => $nextPaymentAt,
        'aff_link'       => $affiliate_link_id
    ]);

    // f) If free Whop, add to whop_members
    if ($price <= 0.00) {
        $jmStmt = $pdo->prepare("
          INSERT IGNORE INTO whop_members (user_id, whop_id, joined_at)
          VALUES (:user_id, :whop_id, UTC_TIMESTAMP())
        ");
        $jmStmt->execute([
            'user_id' => $user_id,
            'whop_id' => $whopId
        ]);
        $hist = $pdo->prepare("INSERT IGNORE INTO whop_member_history (user_id, whop_id, joined_at) VALUES (:user_id, :whop_id, UTC_TIMESTAMP())");
        $hist->execute(['user_id' => $user_id, 'whop_id' => $whopId]);
    }

    // g) Insert payment record
    $payStmt = $pdo->prepare("
      INSERT INTO payments (user_id, whop_id, amount, currency, payment_date, type)
      VALUES (:user_id, :whop_id, :amount, :currency, :payment_date, :type)
    ");
    $payType = $is_recurring === 1 ? 'recurring' : 'one_time';
    $payStmt->execute([
        'user_id'      => $user_id,
        'whop_id'      => $whopId,
        'amount'       => $price,
        'currency'     => $currency,
        'payment_date' => $startAt,
        'type'         => $payType
    ]);

    $pdo->commit();
    echo json_encode([
        "status"  => "success",
        "message" => "Successfully subscribed!"
    ]);
    exit;
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
    exit;
}
