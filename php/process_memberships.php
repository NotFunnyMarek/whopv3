<?php
// /byx/php/process_memberships.php

date_default_timezone_set('UTC');

require_once __DIR__ . '/config_login.php';

try {
    $pdo = new PDO(
        "mysql:host=$servername;dbname=$database;charset=utf8mb4",
        $db_username,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    error_log("process_memberships - Connection failed: " . $e->getMessage());
    exit(1);
}

try {
    // Select all active memberships whose next_payment_at has already passed (UTC)
    $sql = "
        SELECT
          m.id              AS membership_id,
          m.user_id         AS user_id,
          m.whop_id         AS whop_id,
          m.price           AS price,
          m.currency        AS currency,
          m.billing_period  AS billing_period,
          m.next_payment_at AS next_payment_at,
          m.is_recurring    AS is_recurring,
          w.owner_id        AS owner_id
        FROM memberships AS m
        JOIN whops        AS w ON m.whop_id = w.id
        WHERE m.status = 'active'
          AND m.next_payment_at <= UTC_TIMESTAMP()
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $dueRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($dueRows as $r) {
        $membershipId  = (int)$r['membership_id'];
        $uid           = (int)$r['user_id'];
        $wid           = (int)$r['whop_id'];
        $price         = (float)$r['price'];
        $currency      = $r['currency'];
        $billingPeriod = $r['billing_period'];
        $ownerId       = (int)$r['owner_id'];
        $currentNext   = $r['next_payment_at'];   // UTC time that has just passed
        $isRecurring   = (int)$r['is_recurring'];

        // 1) If the user has disabled recurrence (is_recurring = 0),
        //    cancel the membership without further payment.
        if ($isRecurring === 0) {
            $cancelStmt = $pdo->prepare("
                UPDATE memberships
                SET status = 'canceled', next_payment_at = NULL
                WHERE id = :mid
            ");
            $cancelStmt->execute(['mid' => $membershipId]);
            continue;
        }

        // 2) User does not want recurrence? (isprefetch – already handled). Otherwise, attempt another payment:

        // 2a) Load the user's current balance
        $uStmt = $pdo->prepare("SELECT balance FROM users4 WHERE id = :uid LIMIT 1");
        $uStmt->execute(['uid' => $uid]);
        $uRow = $uStmt->fetch(PDO::FETCH_ASSOC);

        // If the user does not exist → payment failure
        if (!$uRow) {
            // Insert a 'failed' record
            $failedStmt = $pdo->prepare("
                INSERT INTO payments
                  (user_id, whop_id, amount, currency, payment_date, type)
                VALUES
                  (:user_id, :whop_id, :amount, :currency, :payment_date, 'failed')
            ");
            $failedStmt->execute([
                'user_id'      => $uid,
                'whop_id'      => $wid,
                'amount'       => $price,
                'currency'     => $currency,
                'payment_date' => $currentNext
            ]);
            // Cancel the membership
            $cancelStmt = $pdo->prepare("
                UPDATE memberships
                SET status = 'canceled', next_payment_at = NULL
                WHERE id = :mid
            ");
            $cancelStmt->execute(['mid' => $membershipId]);
            continue;
        }

        $userBalance = (float)$uRow['balance'];

        // 2b) Insufficient balance → insert a 'failed' record and cancel
        if ($userBalance < $price) {
            $failedStmt = $pdo->prepare("
                INSERT INTO payments
                  (user_id, whop_id, amount, currency, payment_date, type)
                VALUES
                  (:user_id, :whop_id, :amount, :currency, :payment_date, 'failed')
            ");
            $failedStmt->execute([
                'user_id'      => $uid,
                'whop_id'      => $wid,
                'amount'       => $price,
                'currency'     => $currency,
                'payment_date' => $currentNext
            ]);

            $updFail = $pdo->prepare("
                UPDATE memberships
                SET status = 'canceled', next_payment_at = NULL
                WHERE id = :mid
            ");
            $updFail->execute(['mid' => $membershipId]);
            continue;
        }

        // 3) Sufficient funds → process the recurring payment
        try {
            $pdo->beginTransaction();

            // 3a) Deduct from the user's account
            $upd1 = $pdo->prepare("
                UPDATE users4
                SET balance = balance - :price
                WHERE id = :uid
            ");
            $upd1->execute(['price' => $price, 'uid' => $uid]);

            // 3b) Credit the Whop owner
            $upd2 = $pdo->prepare("
                UPDATE users4
                SET balance = balance + :price
                WHERE id = :owner_id
            ");
            $upd2->execute(['price' => $price, 'owner_id' => $ownerId]);

            // 3c) Insert a 'recurring' record
            $payStmt = $pdo->prepare("
                INSERT INTO payments
                  (user_id, whop_id, amount, currency, payment_date, type)
                VALUES
                  (:user_id, :whop_id, :amount, :currency, :payment_date, 'recurring')
            ");
            $payStmt->execute([
                'user_id'      => $uid,
                'whop_id'      => $wid,
                'amount'       => $price,
                'currency'     => $currency,
                'payment_date' => $currentNext
            ]);

            // 3d) Calculate the new next_payment_at based on the billing_period
            $currentNextDt = new DateTime($currentNext, new DateTimeZone('UTC'));

            if (preg_match('/^(\d+)\s*(min(ute)?s?)$/i', $billingPeriod, $m)) {
                $interval = new DateInterval("PT{$m[1]}M");
            }
            elseif (preg_match('/^(\d+)\s*(day|days)$/i', $billingPeriod, $m)) {
                $interval = new DateInterval("P{$m[1]}D");
            }
            elseif (preg_match('/^(\d+)\s*(year|years)$/i', $billingPeriod, $m)) {
                $interval = new DateInterval("P{$m[1]}Y");
            } else {
                $interval = new DateInterval("P30D");
            }

            $newNextDt  = clone $currentNextDt;
            $newNextDt->add($interval);
            $newNextStr = $newNextDt->format("Y-m-d H:i:s");

            $updNextStmt = $pdo->prepare("
                UPDATE memberships
                SET next_payment_at = :new_next
                WHERE id = :mid
            ");
            $updNextStmt->execute(['new_next' => $newNextStr, 'mid' => $membershipId]);

            $pdo->commit();
        }
        catch (Exception $e) {
            // 4) On transaction error → rollback, insert 'failed', and cancel
            $pdo->rollBack();

            $failedStmt = $pdo->prepare("
                INSERT INTO payments
                  (user_id, whop_id, amount, currency, payment_date, type)
                VALUES
                  (:user_id, :whop_id, :amount, :currency, :payment_date, 'failed')
            ");
            $failedStmt->execute([
                'user_id'      => $uid,
                'whop_id'      => $wid,
                'amount'       => $price,
                'currency'     => $currency,
                'payment_date' => $currentNext
            ]);

            $cancelStmt = $pdo->prepare("
                UPDATE memberships
                SET status = 'canceled', next_payment_at = NULL
                WHERE id = :mid
            ");
            $cancelStmt->execute(['mid' => $membershipId]);
        }
    }
}
catch (Exception $e) {
    error_log("process_memberships overall error: " . $e->getMessage());
}
