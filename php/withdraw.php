<?php
// Path: /byx/php/withdraw.php

error_reporting(0);
ini_set('display_errors', 0);

// 1) CORS configuration
$allowed_origins = [
    'http://localhost:3000',
    'https://app.byxbot.com'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 2) Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode([
      "status"  => "error",
      "message" => "You are not logged in"
    ]);
    exit;
}

// 3) Database connection
require_once __DIR__ . '/config_login.php';
$conn = new mysqli($servername, $db_username, $db_password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
      "status"  => "error",
      "message" => "Cannot connect to the database"
    ]);
    exit;
}

// 4) Read JSON body
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
      "status"  => "error",
      "message" => "Invalid JSON body"
    ]);
    $conn->close();
    exit;
}

$usdAmount  = isset($data['usdAmount'])   ? floatval($data['usdAmount'])   : 0.0;
$solAddress = isset($data['solAddress'])  ? trim($conn->real_escape_string($data['solAddress'])) : '';

// 5) Validation
if ($usdAmount <= 0) {
    http_response_code(400);
    echo json_encode([
      "status"  => "error",
      "message" => "Amount to withdraw must be greater than 0"
    ]);
    $conn->close();
    exit;
}
if ($solAddress === '') {
    http_response_code(400);
    echo json_encode([
      "status"  => "error",
      "message" => "Please provide a target Solana address"
    ]);
    $conn->close();
    exit;
}

// 6) Check user's USD balance
$resBalance = $conn->query("SELECT balance FROM users4 WHERE id = $user_id LIMIT 1");
if (!$resBalance || $resBalance->num_rows === 0) {
    http_response_code(500);
    echo json_encode([
      "status"  => "error",
      "message" => "User not found"
    ]);
    $conn->close();
    exit;
}
$row = $resBalance->fetch_assoc();
$currentBalance = floatval($row['balance']);
if ($currentBalance < $usdAmount) {
    http_response_code(400);
    echo json_encode([
      "status"  => "error",
      "message" => "Insufficient balance"
    ]);
    $conn->close();
    exit;
}

// 7) Fetch current SOL price in USD from CoinGecko
function getSolPriceUSD(): ?float {
    $curl = curl_init();
    curl_setopt_array($curl, [
      CURLOPT_URL            => "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT        => 5,
    ]);
    $resp = curl_exec($curl);
    if (!$resp) {
      curl_close($curl);
      return null;
    }
    $json = json_decode($resp, true);
    curl_close($curl);
    return is_array($json) && isset($json['solana']['usd']) ? floatval($json['solana']['usd']) : null;
}

$solPrice = getSolPriceUSD();
if ($solPrice === null) {
    http_response_code(500);
    echo json_encode([
      "status"  => "error",
      "message" => "Failed to retrieve SOL price"
    ]);
    $conn->close();
    exit;
}

// 8) Convert USD to SOL, rounding down to 8 decimal places
$solAmount = floor(($usdAmount / $solPrice) * 1e8) / 1e8;
if ($solAmount <= 0) {
    http_response_code(400);
    echo json_encode([
      "status"  => "error",
      "message" => "USD amount too small to convert to SOL"
    ]);
    $conn->close();
    exit;
}

// 9) Deduct USD from user's balance
$newBalance = $currentBalance - $usdAmount;
$stmtUpd = $conn->prepare("UPDATE users4 SET balance = ? WHERE id = ?");
$stmtUpd->bind_param('di', $newBalance, $user_id);
if (!$stmtUpd->execute()) {
    http_response_code(500);
    echo json_encode([
      "status"  => "error",
      "message" => "Error updating balance"
    ]);
    $conn->close();
    exit;
}
$stmtUpd->close();

// 10) Insert withdrawal record
$stmtIns = $conn->prepare("
  INSERT INTO withdraw_records
    (user_id, sol_address, sol_amount, usd_amount)
  VALUES (?, ?, ?, ?)
");
$stmtIns->bind_param('isdd', $user_id, $solAddress, $solAmount, $usdAmount);
if (!$stmtIns->execute()) {
    // Roll back balance update
    $conn->query("UPDATE users4 SET balance = $currentBalance WHERE id = $user_id");
    http_response_code(500);
    echo json_encode([
      "status"  => "error",
      "message" => "Error saving withdrawal record"
    ]);
    $conn->close();
    exit;
}
$withdrawId = $stmtIns->insert_id;
$stmtIns->close();

// 11) Execute Node script withdraw.js to perform SOL transfer
$nodePath   = '/usr/bin/node';               // Adjust if Node is elsewhere
$scriptPath = '/solana-monitor/withdraw.js'; // Absolute path to withdraw.js

$cmd = escapeshellcmd("$nodePath $scriptPath $solAddress $solAmount");
// Capture both stdout and stderr
exec($cmd . " 2>&1", $outputLines, $returnVal);

if ($returnVal === 0) {
    $joined = implode("\n", $outputLines);
    $outJson = @json_decode($joined, true);
    if (is_array($outJson) && isset($outJson['status']) && $outJson['status'] === 'success') {
        $txSig = $outJson['tx'];
        // Save transaction signature back to withdraw_records
        $stmtUpdRec = $conn->prepare("
          UPDATE withdraw_records
             SET tx_signature = ?
           WHERE id = ?
        ");
        $stmtUpdRec->bind_param('si', $txSig, $withdrawId);
        $stmtUpdRec->execute();
        $stmtUpdRec->close();

        http_response_code(200);
        echo json_encode([
          "status"  => "success",
          "message" => "Withdrawal successful.",
          "tx"      => $txSig
        ]);
        $conn->close();
        exit;
    }
    // Node script returned valid JSON but not success → rollback balance
    $conn->query("UPDATE users4 SET balance = $currentBalance WHERE id = $user_id");
    http_response_code(500);
    echo json_encode([
      "status"  => "error",
      "message" => "Node script error: " . ($outJson['message'] ?? $joined)
    ]);
    $conn->close();
    exit;
} else {
    // Node script exit code error → rollback balance
    $conn->query("UPDATE users4 SET balance = $currentBalance WHERE id = $user_id");
    http_response_code(500);
    $joined = implode("\n", $outputLines);
    echo json_encode([
      "status"  => "error",
      "message" => "Error running Node script: " . $joined
    ]);
    $conn->close();
    exit;
}
