<?php
// php/profile.php

// --- CORS setup ---
$allowed = ["http://localhost:3000", "https://localhost:3000"];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/session_init.php';

// Check authentication
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "User is not logged in"]);
    exit;
}

require_once __DIR__ . '/config_login.php';

$conn = new mysqli($servername, $db_username, $db_password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Cannot connect to the database"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch user profile
    $sql = "
      SELECT username, email, name, bio, phone, avatar_url, balance
      FROM users4
      WHERE id = ?
      LIMIT 1
    ";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        echo json_encode([
            "status" => "success",
            "data"   => [
                "username"   => $row['username'],
                "email"      => $row['email'],
                "name"       => $row['name'],
                "bio"        => $row['bio'],
                "phone"      => $row['phone'],
                "avatar_url" => $row['avatar_url'] ?: '',
                "balance"    => $row['balance']     ?: 0
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "User not found"]);
    }

    $conn->close();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputJSON = file_get_contents('php://input');
    $data = json_decode($inputJSON, true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid JSON body"]);
        $conn->close();
        exit;
    }

    // Only avatar update
    if (isset($data['avatar_url']) && count($data) === 1) {
        $avatar_url = $conn->real_escape_string(trim($data['avatar_url']));
        $updateSql = "
          UPDATE users4 SET 
            avatar_url = '$avatar_url'
          WHERE id = $user_id
        ";
        if ($conn->query($updateSql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Avatar saved"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error saving avatar: " . $conn->error]);
        }
        $conn->close();
        exit;
    }

    // Full profile update
    $name       = isset($data['name'])       ? $conn->real_escape_string(trim($data['name']))       : null;
    $bio        = isset($data['bio'])        ? $conn->real_escape_string(trim($data['bio']))        : null;
    $username   = isset($data['username'])   ? $conn->real_escape_string(trim($data['username']))   : null;
    $email      = isset($data['email'])      ? $conn->real_escape_string(trim($data['email']))      : null;
    $phone      = isset($data['phone'])      ? $conn->real_escape_string(trim($data['phone']))      : null;
    $avatar_url = isset($data['avatar_url']) ? $conn->real_escape_string(trim($data['avatar_url'])) : null;

    // Validate required fields
    if ($name === '' || $username === '' || $email === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Name, username, and email cannot be empty"]);
        $conn->close();
        exit;
    }
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid email format"]);
        $conn->close();
        exit;
    }

    // Check username uniqueness
    $checkUserSql = "
      SELECT id FROM users4 
      WHERE username = '$username' AND id != $user_id
      LIMIT 1
    ";
    $resUser = $conn->query($checkUserSql);
    if ($resUser && $resUser->num_rows > 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "This username is already taken"]);
        $conn->close();
        exit;
    }

    // Check display name uniqueness
    $checkNameSql = "
      SELECT id FROM users4 
      WHERE name = '$name' AND id != $user_id
      LIMIT 1
    ";
    $resName = $conn->query($checkNameSql);
    if ($resName && $resName->num_rows > 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "This name is already in use"]);
        $conn->close();
        exit;
    }

    // Build update statement
    $update_fields = "
      name = '$name',
      bio = '$bio',
      username = '$username',
      email = '$email',
      phone = '$phone'
    ";
    if ($avatar_url !== null) {
        $update_fields .= ", avatar_url = '$avatar_url'";
    }

    $updateSql = "UPDATE users4 SET $update_fields WHERE id = $user_id";
    if ($conn->query($updateSql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Profile saved"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error saving profile: " . $conn->error]);
    }

    $conn->close();
    exit;
}

// Method not allowed
http_response_code(405);
echo json_encode(["status" => "error", "message" => "Method not allowed"]);
exit;
?>
