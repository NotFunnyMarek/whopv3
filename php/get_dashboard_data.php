<?php
// php/get_dashboard_data.php

// ════════════════════════════════════════════════
// 1) CORS & headers
// ════════════════════════════════════════════════
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ════════════════════════════════════════════════
// 2) Session & user authentication
// ════════════════════════════════════════════════
session_start();
$user_id_raw = $_SESSION['user_id'] ?? null;
if (!$user_id_raw) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized – not logged in"]);
    exit;
}
$user_id = intval($user_id_raw);

// ════════════════════════════════════════════════
// 3) Read whop_id parameter
// ════════════════════════════════════════════════
if (!isset($_GET['whop_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing whop_id parameter"]);
    exit;
}
$whopId = intval($_GET['whop_id']);

// ════════════════════════════════════════════════
// 4) Database connection
// ════════════════════════════════════════════════
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

// ════════════════════════════════════════════════
// 5) Verify that the Whop exists and get owner_id + slug
// ════════════════════════════════════════════════
try {
    $stmtOwner = $pdo->prepare("SELECT owner_id, slug FROM whops WHERE id = :whop_id LIMIT 1");
    $stmtOwner->execute(['whop_id' => $whopId]);
    $rowOwner = $stmtOwner->fetch(PDO::FETCH_ASSOC);
    if (!$rowOwner) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Whop not found"]);
        exit;
    }
    $ownerId  = intval($rowOwner['owner_id']);
    $whopSlug = $rowOwner['slug'];
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error loading whop: " . $e->getMessage()]);
    exit;
}

// ════════════════════════════════════════════════
// 6) Determine role (owner / moderator / other)
// ════════════════════════════════════════════════
$role = "";
if ($user_id === $ownerId) {
    $role = "owner";
} else {
    try {
        $stmtMod = $pdo->prepare("
            SELECT 1
            FROM whop_moderators
            WHERE whop_id = :whop_id
              AND user_id = :user_id
            LIMIT 1
        ");
        $stmtMod->execute([
            'whop_id' => $whopId,
            'user_id' => $user_id
        ]);
        if ($stmtMod->fetch()) {
            $role = "moderator";
        }
    } catch (PDOException $e) {
        // leave role empty
    }
}
if ($role === "") {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "You do not have permission to access this dashboard"]);
    exit;
}

// ════════════════════════════════════════════════
// 7) Assemble members data (paid and free)
// ════════════════════════════════════════════════
// 7.1) Active paid memberships
try {
    $stmtPaid = $pdo->prepare("
        SELECT m.user_id, u.username, u.email, m.start_at
        FROM memberships AS m
        JOIN users4 AS u ON m.user_id = u.id
        WHERE m.whop_id = :whop_id
          AND m.status = 'active'
        ORDER BY m.start_at DESC
    ");
    $stmtPaid->execute(['whop_id' => $whopId]);
    $paidMembers = $stmtPaid->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error loading paid members: " . $e->getMessage()]);
    exit;
}

// 7.2) Free members
try {
    $stmtFree = $pdo->prepare("
        SELECT wm.user_id, u.username, u.email, wm.created_at AS joined_at
        FROM whop_members AS wm
        JOIN users4 AS u ON wm.user_id = u.id
        WHERE wm.whop_id = :whop_id
        ORDER BY wm.created_at DESC
    ");
    $stmtFree->execute(['whop_id' => $whopId]);
    $freeMembers = $stmtFree->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error loading free members: " . $e->getMessage()]);
    exit;
}

$members = [];
foreach ($paidMembers as $m) {
    $members[] = [
        'user_id'  => (int)$m['user_id'],
        'username' => $m['username'],
        'email'    => $m['email'],
        'start_at' => $m['start_at'],
        'type'     => 'paid'
    ];
}
foreach ($freeMembers as $m) {
    $members[] = [
        'user_id'  => (int)$m['user_id'],
        'username' => $m['username'],
        'email'    => $m['email'],
        'start_at' => $m['joined_at'],
        'type'     => 'free'
    ];
}

// ════════════════════════════════════════════════
// 8) List of payments
// ════════════════════════════════════════════════
try {
    $stmtPay = $pdo->prepare("
        SELECT 
          p.id AS payment_id,
          p.user_id,
          u.username,
          u.email,
          p.amount,
          p.currency,
          p.payment_date,
          p.type
        FROM payments AS p
        JOIN users4 AS u ON p.user_id = u.id
        WHERE p.whop_id = :whop_id
        ORDER BY p.payment_date DESC
    ");
    $stmtPay->execute(['whop_id' => $whopId]);
    $payments = $stmtPay->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error loading payments: " . $e->getMessage()]);
    exit;
}

// ════════════════════════════════════════════════
// 9) Gross revenue
// ════════════════════════════════════════════════
try {
    $stmtSum = $pdo->prepare("
        SELECT COALESCE(SUM(amount),0) AS total 
        FROM payments 
        WHERE whop_id = :whop_id
    ");
    $stmtSum->execute(['whop_id' => $whopId]);
    $rowSum = $stmtSum->fetch(PDO::FETCH_ASSOC);
    $grossRevenue = floatval($rowSum['total']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error calculating revenue: " . $e->getMessage()]);
    exit;
}

// ════════════════════════════════════════════════
// 10) Count of members
// ════════════════════════════════════════════════
$membersCount = count($members);

// ════════════════════════════════════════════════
// 11) Ban list
// ════════════════════════════════════════════════
try {
    $stmtBans = $pdo->prepare("
        SELECT b.user_id, u.username, u.email, b.banned_at
        FROM whop_bans AS b
        JOIN users4 AS u ON b.user_id = u.id
        WHERE b.whop_id = :whop_id
        ORDER BY b.banned_at DESC
    ");
    $stmtBans->execute(['whop_id' => $whopId]);
    $bans = $stmtBans->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error loading bans: " . $e->getMessage()]);
    exit;
}

// ════════════════════════════════════════════════
// 12) Moderators list
// ════════════════════════════════════════════════
try {
    $stmtMods = $pdo->prepare("
        SELECT wm.user_id, u.username, u.email, wm.added_at
        FROM whop_moderators AS wm
        JOIN users4 AS u ON wm.user_id = u.id
        WHERE wm.whop_id = :whop_id
        ORDER BY wm.added_at DESC
    ");
    $stmtMods->execute(['whop_id' => $whopId]);
    $moderators = $stmtMods->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error loading moderators: " . $e->getMessage()]);
    exit;
}

// ════════════════════════════════════════════════
// 13) Waitlist requests (with id = user_id alias)
// ════════════════════════════════════════════════
try {
    $stmtReq = $pdo->prepare("
        SELECT
          wr.user_id      AS id,
          wr.user_id      AS user_id,
          u.username,
          u.email,
          wr.requested_at,
          wr.answers_json
        FROM waitlist_requests AS wr
        JOIN users4 AS u ON wr.user_id = u.id
        WHERE wr.whop_id = :whop_id
          AND wr.status = 'pending'
        ORDER BY wr.requested_at ASC
    ");
    $stmtReq->execute(['whop_id' => $whopId]);
    $rawReqs = $stmtReq->fetchAll(PDO::FETCH_ASSOC);

    $waitlist_requests = array_map(function($r) {
        return [
            'id'           => (int)$r['id'],
            'user_id'      => (int)$r['user_id'],
            'username'     => $r['username'],
            'email'        => $r['email'],
            'requested_at' => $r['requested_at'],
            'answers'      => json_decode($r['answers_json'], true) ?: []
        ];
    }, $rawReqs);
} catch (PDOException $e) {
    $waitlist_requests = [];
}

// ════════════════════════════════════════════════
// 14) Return JSON including waitlist_requests
// ════════════════════════════════════════════════
echo json_encode([
    "status"             => "success",
    "role"               => $role,
    "slug"               => $whopSlug,
    "waitlist_requests"  => $waitlist_requests,
    "members"            => $members,
    "payments"           => $payments,
    "grossRevenue"       => $grossRevenue,
    "membersCount"       => $membersCount,
    "bans"               => $bans,
    "moderators"         => $moderators
]);
exit;
