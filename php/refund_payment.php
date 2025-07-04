<?php
// php/refund_payment.php

// 1) CORS & headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2) Session & user authentication
require_once __DIR__ . '/session_init.php';
$currentUserId = $_SESSION['user_id'] ?? null;
if (!$currentUserId) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "Unauthorized – you are not logged in"
    ]);
    exit;
}
$currentUserId = (int)$currentUserId;

// 3) Read input data
$input = json_decode(file_get_contents('php://input'), true);
if (
    !$input ||
    !isset($input['payment_id']) ||
    !isset($input['whop_id'])
) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Missing payment_id or whop_id"
    ]);
    exit;
}
$paymentId = (int)$input['payment_id'];
$whopId    = (int)$input['whop_id'];

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
        "message" => "Database connection failed: " . $e->getMessage()
    ]);
    exit;
}

// 5) Determine owner of the Whop
try {
    $stmtOwner = $pdo->prepare("
        SELECT owner_id
          FROM whops
         WHERE id = :whop_id
         LIMIT 1
    ");
    $stmtOwner->execute(['whop_id' => $whopId]);
    $ownerRow = $stmtOwner->fetch(PDO::FETCH_ASSOC);
    if (!$ownerRow) {
        http_response_code(404);
        echo json_encode([
            "status"  => "error",
            "message" => "Whop not found"
        ]);
        exit;
    }
    $ownerId = (int)$ownerRow['owner_id'];
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error fetching Whop owner: " . $e->getMessage()
    ]);
    exit;
}

// 6) Only the owner can issue a refund
if ($currentUserId !== $ownerId) {
    http_response_code(403);
    echo json_encode([
        "status"  => "error",
        "message" => "Only the owner can issue a refund"
    ]);
    exit;
}

// 7) Fetch the payment details
try {
    $stmtPayment = $pdo->prepare("
        SELECT user_id AS payer_id, amount, currency, type
          FROM payments
         WHERE id = :payment_id
           AND whop_id = :whop_id
         LIMIT 1
    ");
    $stmtPayment->execute([
        'payment_id' => $paymentId,
        'whop_id'    => $whopId
    ]);
    $paymentRow = $stmtPayment->fetch(PDO::FETCH_ASSOC);
    if (!$paymentRow) {
        http_response_code(404);
        echo json_encode([
            "status"  => "error",
            "message" => "Payment not found"
        ]);
        exit;
    }
    $payerId = (int)$paymentRow['payer_id'];
    $amount  = (float)$paymentRow['amount'];
    $type    = $paymentRow['type'];
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error fetching payment: " . $e->getMessage()
    ]);
    exit;
}

// 8) Cannot refund a payment that's already refunded or failed
if (in_array($type, ['refunded', 'failed_refunded', 'failed'], true)) {
    http_response_code(409);
    echo json_encode([
        "status"  => "error",
        "message" => "Payment has already been refunded or cannot be refunded"
    ]);
    exit;
}

// 9) Check owner's balance to cover the refund
try {
    $stmtOwnerBal = $pdo->prepare("
        SELECT balance
          FROM users4
         WHERE id = :owner_id
         LIMIT 1
    ");
    $stmtOwnerBal->execute(['owner_id' => $ownerId]);
    $ownerBalRow = $stmtOwnerBal->fetch(PDO::FETCH_ASSOC);
    if (!$ownerBalRow) {
        http_response_code(500);
        echo json_encode([
            "status"  => "error",
            "message" => "Owner not found"
        ]);
        exit;
    }
    $ownerBalance = (float)$ownerBalRow['balance'];
    if ($ownerBalance < $amount) {
        http_response_code(400);
        echo json_encode([
            "status"  => "error",
            "message" => "Insufficient owner balance to process refund"
        ]);
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error checking owner balance: " . $e->getMessage()
    ]);
    exit;
}

// 10) Perform the refund transactionally
try {
    $pdo->beginTransaction();

    // a) Deduct from owner's balance
    $stmtDeductOwner = $pdo->prepare("
        UPDATE users4
           SET balance = balance - :amount
         WHERE id = :owner_id
    ");
    $stmtDeductOwner->execute([
        'amount'   => $amount,
        'owner_id' => $ownerId
    ]);

    // b) Credit the payer
    $stmtCreditPayer = $pdo->prepare("
        UPDATE users4
           SET balance = balance + :amount
         WHERE id = :payer_id
    ");
    $stmtCreditPayer->execute([
        'amount'   => $amount,
        'payer_id' => $payerId
    ]);

    // c) Mark the payment as refunded
    $stmtUpdatePayment = $pdo->prepare("
        UPDATE payments
           SET type = 'refunded'
         WHERE id = :payment_id
    ");
    $stmtUpdatePayment->execute(['payment_id' => $paymentId]);

    $pdo->commit();

    echo json_encode([
        "status"  => "success",
        "message" => "Payment successfully refunded"
    ]);
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Error processing refund: " . $e->getMessage()
    ]);
    exit;
}
