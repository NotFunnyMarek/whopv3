<?php
// File: php/search_whops.php

// ================================
// CORS & headers
// ================================
$allowed_origins = [
    'http://localhost:3000',
    'https://app.byxbot.com'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/config_login.php";

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
        "message" => "Database connection failed"
    ]);
    exit;
}

// =====================================
// Pokud all=1, vrátíme všechny whopy
// =====================================
if (isset($_GET['all']) && $_GET['all'] === '1') {
    try {
        $sql = "
        SELECT
          w.id,
          w.name,
          w.slug,
          w.description,
          w.logo_url,
          w.banner_url,
          w.currency,
          w.price,
          w.is_recurring,
          w.billing_period,
          w.created_at,
          COALESCE(SUM(p.amount),0) AS revenue,
          (
            (SELECT COUNT(*) FROM whop_members WHERE whop_id = w.id)
            +
            (SELECT COUNT(*) FROM memberships WHERE whop_id = w.id AND status = 'active')
          ) AS members_count,
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'title', f.title,
                'subtitle', f.subtitle,
                'image_url', f.image_url
              )
            )
            FROM whop_features AS f
            WHERE f.whop_id = w.id
          )) AS features,
          (
            SELECT JSON_ARRAYAGG(JSON_OBJECT(
              'id', pp.id,
              'plan_name', pp.plan_name,
              'description', pp.description,
              'price', pp.price,
              'currency', pp.currency,
              'billing_period', pp.billing_period,
              'sort_order', pp.sort_order
            ))
            FROM (
              SELECT * FROM whop_pricing_plans WHERE whop_id = w.id ORDER BY sort_order, id
            ) AS pp
          ) AS pricing_plans,
        FROM whops AS w
        LEFT JOIN payments AS p
          ON p.whop_id = w.id
        GROUP BY w.id
        ORDER BY revenue DESC
        ";
        $stmt = $pdo->query($sql);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($items as &$row) {
            $row["features"] = $row["features"] ? json_decode($row["features"], true) : [];
            $row["pricing_plans"] = $row["pricing_plans"] ? json_decode($row["pricing_plans"], true) : [];
        }
        unset($row);

        echo json_encode([
            "status" => "success",
            "data"   => $items
        ]);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "status"  => "error",
            "message" => "SQL error: " . $e->getMessage()
        ]);
        exit;
    }
}

// =====================================
          COALESCE(SUM(p.amount),0) AS revenue,
          (
            SELECT JSON_ARRAYAGG(JSON_OBJECT(
              'title', f.title,
              'subtitle', f.subtitle,
              'image_url', f.image_url
            ))
            FROM whop_features AS f
            WHERE f.whop_id = w.id
          ) AS features,
          (
            SELECT JSON_ARRAYAGG(JSON_OBJECT(
              'id', pp.id,
              'plan_name', pp.plan_name,
              'description', pp.description,
              'price', pp.price,
              'currency', pp.currency,
              'billing_period', pp.billing_period,
              'sort_order', pp.sort_order
            ))
            FROM (
              SELECT * FROM whop_pricing_plans WHERE whop_id = w.id ORDER BY sort_order, id
            ) AS pp
          ) AS pricing_plans
    foreach ($items as &$row) {
        $row["features"] = $row["features"] ? json_decode($row["features"], true) : [];
        $row["pricing_plans"] = $row["pricing_plans"] ? json_decode($row["pricing_plans"], true) : [];
    }
    unset($row);
// =====================================
$q = trim($_GET['q'] ?? '');
if ($q === '') {
    echo json_encode([
        "status" => "success",
        "data"   => []
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT
          w.id,
          w.name,
          w.slug,
          w.description,
          w.logo_url,
          w.banner_url,
          w.currency,
          w.price,
          w.is_recurring,
          w.billing_period,
          w.created_at,
          COALESCE(SUM(p.amount),0) AS revenue
        FROM whops AS w
        LEFT JOIN payments AS p
          ON p.whop_id = w.id
        WHERE w.name LIKE :term
           OR w.slug LIKE :term
        GROUP BY w.id
        ORDER BY w.created_at DESC
        LIMIT 10
    ");
    $stmt->execute(['term' => "%$q%"]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data"   => $items
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "SQL error: " . $e->getMessage()
    ]);
}
