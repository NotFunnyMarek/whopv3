<?php
// link_account.php - Manage user's linked social accounts

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/session_init.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

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
    echo json_encode(["status" => "error", "message" => "Database connection error"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT id, platform, account_url, is_verified FROM linked_accounts WHERE user_id = :uid");
    $stmt->execute(['uid' => $user_id]);
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['action'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing action']);
        exit;
    }

    if ($input['action'] === 'create') {
        $platform = $input['platform'] ?? '';
        $url      = trim($input['account_url'] ?? '');
        if (!in_array($platform, ['instagram','tiktok','youtube','discord']) || !filter_var($url, FILTER_VALIDATE_URL)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid platform or URL']);
            exit;
        }
        $dup = $pdo->prepare("SELECT id FROM linked_accounts WHERE user_id=:uid AND account_url=:url LIMIT 1");
        $dup->execute(['uid' => $user_id, 'url' => $url]);
        if ($dup->fetch()) {
            http_response_code(409);
            echo json_encode(['status' => 'error', 'message' => 'Account already linked']);
            exit;
        }
        $code = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        $ins = $pdo->prepare("INSERT INTO linked_accounts (user_id, platform, account_url, verify_code, is_verified, created_at) VALUES (:uid, :plat, :url, :code, 0, NOW())");
        $ins->execute(['uid' => $user_id, 'plat' => $platform, 'url' => $url, 'code' => $code]);
        echo json_encode(['status' => 'success', 'data' => ['id' => $pdo->lastInsertId(), 'verify_code' => $code]]);
        exit;
    }

    if ($input['action'] === 'verify') {
        $id = intval($input['id'] ?? 0);
        $stmt = $pdo->prepare("SELECT id FROM linked_accounts WHERE id=:id AND user_id=:uid LIMIT 1");
        $stmt->execute(['id' => $id, 'uid' => $user_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Record not found']);
            exit;
        }
        $upd = $pdo->prepare("UPDATE linked_accounts SET is_verified=1, verified_at=NOW() WHERE id=:id AND user_id=:uid");
        $upd->execute(['id' => $id, 'uid' => $user_id]);
        echo json_encode(['status' => 'success', 'message' => 'Verified']);
        exit;
    }

    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Unknown action']);
    exit;
}

if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = intval($input['id'] ?? 0);
    $stmt = $pdo->prepare("DELETE FROM linked_accounts WHERE id=:id AND user_id=:uid");
    $stmt->execute(['id' => $id, 'uid' => $user_id]);
    echo json_encode(['status' => 'success', 'message' => 'Account removed']);
    exit;
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
