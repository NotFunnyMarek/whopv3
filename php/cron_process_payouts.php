<?php
// byx/php/cron_process_payouts.php

// 1) CORS preflight
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    http_response_code(200);
    exit;
}

// 2) Database connection
require_once __DIR__ . '/config_login.php';
try {
    $pdo = new PDO(
        "mysql:host=$servername;dbname=$database;charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    error_log("PAYOUT ERROR: Connection failed: " . $e->getMessage());
    exit;
}

// 3) Load all approved submissions and their campaign data
$sql = "
  SELECT 
    s.id                AS sub_id,
    s.user_id           AS user_id,
    s.total_views       AS tv,
    s.processed_views   AS pv,
    c.id                AS camp_id,
    c.whop_id           AS whop_id,
    c.reward_per_thousand,
    c.min_payout,
    c.currency,
    c.budget,
    c.paid_out
  FROM submissions AS s
  JOIN campaign     AS c ON s.campaign_id = c.id
  WHERE s.status = 'approved'
    AND c.is_active = 1
";
$rows = $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);

foreach ($rows as $r) {
    $subId     = (int)$r['sub_id'];
    $userId    = (int)$r['user_id'];
    $tv        = (int)$r['tv'];
    $pv        = (int)$r['pv'];
    $campId    = (int)$r['camp_id'];
    $whopId    = (int)$r['whop_id'];
    $rate      = floatval($r['reward_per_thousand']);
    $minPay    = $r['min_payout'] !== null ? floatval($r['min_payout']) : null;
    $currency  = $r['currency'];
    $budget    = floatval($r['budget']);
    $paidOut   = floatval($r['paid_out']);

    // Calculate views needed to reach minimum payout
    $neededViews = ($minPay !== null && $rate > 0)
      ? ceil(($minPay / $rate) * 1000)
      : 0;

    $toPay      = 0;
    $newPV      = $pv; // how far we will advance processed_views

    // 4a) If we haven't reached the minimum before, but now exceed it:
    if ($minPay !== null && $pv < $neededViews && $tv >= $neededViews) {
        // pay out the entire accumulated potential
        $rawTotal    = ($tv / 1000) * $rate;
        $toPay       = round(min($rawTotal, $budget - $paidOut), 2);
        $newPV       = $neededViews;
    }
    // 4b) Otherwise if we're already past neededViews, pay out only new views
    elseif ($tv > $pv) {
        $deltaViews = $tv - $pv;
        $partialPay = round(($deltaViews / 1000) * $rate, 2);
        $remainingBudget = round($budget - $paidOut, 2);
        $toPay       = round(min($partialPay, $remainingBudget), 2);
        $newPV       = $tv;
    }

    // If there's nothing to pay, just advance processed_views and continue
    if ($toPay <= 0) {
        $pdo->prepare("
            UPDATE submissions 
            SET processed_views = :pv 
            WHERE id = :sid
        ")->execute([':pv' => $newPV, ':sid' => $subId]);
        continue;
    }

    // 5) Transactional write
    try {
        $pdo->beginTransaction();

        // 5a) Add to the user's balance
        $pdo->prepare("
            UPDATE users4 
            SET balance = balance + :amt 
            WHERE id = :uid
        ")->execute([':amt' => $toPay, ':uid' => $userId]);

        // 5b) Update campaign.paid_out
        $pdo->prepare("
            UPDATE campaign 
            SET paid_out = paid_out + :amt 
            WHERE id = :cid
        ")->execute([':amt' => $toPay, ':cid' => $campId]);

        // 5c) Advance processed_views
        $pdo->prepare("
            UPDATE submissions 
            SET processed_views = :pv 
            WHERE id = :sid
        ")->execute([':pv' => $newPV, ':sid' => $subId]);

        // 5d) Record the payout in payments
        $pdo->prepare("
            INSERT INTO payments
              (user_id, whop_id, amount, currency, payment_date, type)
            VALUES
              (:uid, :wid, :amt, :curr, UTC_TIMESTAMP(), 'payout')
        ")->execute([
            ':uid'  => $userId,
            ':wid'  => $whopId,
            ':amt'  => $toPay,
            ':curr' => $currency
        ]);

        $pdo->commit();
        echo "PAYOUT sub {$subId}: +{$toPay} {$currency}\n";

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("PAYOUT ERROR for sub {$subId}: " . $e->getMessage());
        echo "PAYOUT FAILED sub {$subId}: " . $e->getMessage() . "\n";
    }
}
