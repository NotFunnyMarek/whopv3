<?php
// php/accept_waitlist.php

// 0) CORS & headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1) Session & user verification (owner of the Whop)
require_once __DIR__ . '/session_init.php';
$owner_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
if ($owner_id <= 0) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized – you are not logged in"]);
    exit;
}

// 2) Read input
$input      = json_decode(file_get_contents('php://input'), true);
$request_id = isset($input['request_id']) ? (int)$input['request_id'] : 0;  // user_id from waitlist_requests
$whop_id    = isset($input['whop_id'])    ? (int)$input['whop_id']    : 0;
if ($request_id <= 0 || $whop_id <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing request_id or whop_id"]);
    exit;
}

// 3) DB connection
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

// 4) Load waitlist request + ownership check
try {
    $stmt = $pdo->prepare("
        SELECT
          wr.user_id,
          wr.affiliate_link_id,
          w.owner_id,
          w.price,
          w.currency,
          w.is_recurring,
          w.billing_period
        FROM waitlist_requests AS wr
        JOIN whops              AS w ON wr.whop_id = w.id
        WHERE wr.user_id  = :rid
          AND wr.whop_id  = :wid
          AND wr.status   = 'pending'
        LIMIT 1
    ");
    $stmt->execute(['rid' => $request_id, 'wid' => $whop_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Request not found or already handled"]);
        exit;
    }
    if ((int)$row['owner_id'] !== $owner_id) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden – you do not own this Whop"]);
        exit;
    }

    $affiliate_link_id = isset($row['affiliate_link_id']) ? (int)$row['affiliate_link_id'] : null;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "DB error: " . $e->getMessage()]);
    exit;
}

// 5) Check member's balance
$member_id     = (int)$row['user_id'];
$price         = floatval($row['price']);
$currency      = $row['currency'];
$is_recurring  = (int)$row['is_recurring'];
$billing_period= $row['billing_period'];

try {
    $balStmt = $pdo->prepare("SELECT balance FROM users4 WHERE id = :uid LIMIT 1");
    $balStmt->execute(['uid' => $member_id]);
    $balRow = $balStmt->fetch(PDO::FETCH_ASSOC);
    if (!$balRow || floatval($balRow['balance']) < $price) {
        // insufficient balance → delete request
        $pdo->prepare("
            DELETE FROM waitlist_requests
            WHERE user_id = :rid AND whop_id = :wid
        ")->execute(['rid' => $request_id, 'wid' => $whop_id]);

        echo json_encode(["status" => "error", "message" => "Insufficient balance – request denied"]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "DB error: " . $e->getMessage()]);
    exit;
}

// 6) Perform transaction
try {
    $pdo->beginTransaction();

    // a) Deduct from member
    $pdo->prepare("UPDATE users4 SET balance = balance - :price WHERE id = :uid")
        ->execute(['price' => $price, 'uid' => $member_id]);

    // b) Handle affiliate payout if waitlist recorded a link
    $affiliate_amount = 0.0;
    if ($affiliate_link_id) {
        $affStmt = $pdo->prepare('SELECT user_id, payout_percent, payout_recurring FROM affiliate_links WHERE id = :id LIMIT 1');
        $affStmt->execute(['id' => $affiliate_link_id]);
        $affRow = $affStmt->fetch(PDO::FETCH_ASSOC);
        if ($affRow) {
            $affiliate_amount = $price * (floatval($affRow['payout_percent']) / 100.0);
            $pdo->prepare('UPDATE users4 SET balance = balance + :amt WHERE id = :aid')
                ->execute(['amt' => $affiliate_amount, 'aid' => (int)$affRow['user_id']]);
            $pdo->prepare('UPDATE affiliate_links SET signups = signups + 1 WHERE id = :id')
                ->execute(['id' => $affiliate_link_id]);
            $pdo->prepare('INSERT INTO payments (user_id, whop_id, amount, currency, payment_date, type) VALUES (:uid, :wid, :amt, :curr, UTC_TIMESTAMP(), "payout")')
                ->execute([
                    'uid'  => (int)$affRow['user_id'],
                    'wid'  => $whop_id,
                    'amt'  => $affiliate_amount,
                    'curr' => $currency
                ]);
        }
    }

    // c) Credit the owner with remaining amount
    $owner_amount = $price - $affiliate_amount;
    $pdo->prepare("UPDATE users4 SET balance = balance + :price WHERE id = :own")
        ->execute(['price' => $owner_amount, 'own' => $row['owner_id']]);

    // d) Insert into payments
    $now = new DateTime('now', new DateTimeZone('UTC'));
    $startAt = $now->format('Y-m-d H:i:s');
    $payType = $is_recurring === 1 ? 'recurring' : 'one_time';

    $pdo->prepare("
      INSERT INTO payments
        (user_id, whop_id, amount, currency, payment_date, type)
      VALUES
        (:user_id, :whop_id, :amount, :currency, :payment_date, :type)
    ")->execute([
        'user_id'      => $member_id,
        'whop_id'      => $whop_id,
        'amount'       => $price,
        'currency'     => $currency,
        'payment_date' => $startAt,
        'type'         => $payType
    ]);

    // e) If price is 0, add to whop_members (optional)
    if ($price <= 0.00) {
        $pdo->prepare("
          INSERT IGNORE INTO whop_members (user_id, whop_id, joined_at)
          VALUES (:user_id, :whop_id, UTC_TIMESTAMP())
        ")->execute(['user_id'=>$member_id, 'whop_id'=>$whop_id]);
    }

    // f) Insert into memberships
    if ($is_recurring === 1) {
        // Billing period parsing: could be "30 days", "1 year", etc.
        if (preg_match('/^(\d+)\s*(min(ute)?s?)$/i', $billing_period, $m)) {
            $interval = new DateInterval("PT{$m[1]}M");
        } elseif (preg_match('/^(\d+)\s*(day|days)$/i', $billing_period, $m)) {
            $interval = new DateInterval("P{$m[1]}D");
        } elseif (preg_match('/^(\d+)\s*(year|years)$/i', $billing_period, $m)) {
            $interval = new DateInterval("P{$m[1]}Y");
        } else {
            $interval = new DateInterval("P30D");
        }
        $nextPaymentAt = (new DateTime($startAt, new DateTimeZone('UTC')))->add($interval)
                                                                            ->format('Y-m-d H:i:s');
    } else {
        $nextPaymentAt = null;
    }

    $pdo->prepare(
      "INSERT INTO memberships
        (user_id, whop_id, price, currency, is_recurring, billing_period, start_at, next_payment_at, affiliate_link_id, status)
       VALUES
        (:user_id, :whop_id, :price, :currency, :recurring, :period, :start_at, :next_at, :aff_link, 'active')"
    )->execute([
        'user_id'   => $member_id,
        'whop_id'   => $whop_id,
        'price'     => $price,
        'currency'  => $currency,
        'recurring' => $is_recurring,
        'period'    => $billing_period,
        'start_at'  => $startAt,
        'next_at'   => $nextPaymentAt,
        'aff_link' => $affiliate_link_id
    ]);

    // f) Delete the request from the waitlist
    $pdo->prepare("
      DELETE FROM waitlist_requests
      WHERE user_id = :rid AND whop_id = :wid
    ")->execute(['rid' => $request_id, 'wid' => $whop_id]);

    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "User accepted, payment processed"]);
    exit;

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Transaction failed: " . $e->getMessage()]);
    exit;
}
