<?php
// API endpoint to check if a username is already taken

// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get username from request
$inData = getRequestInfo();
$username = isset($inData["username"]) ? $inData["username"] : "";

// If username is empty, return error
if (empty($username)) {
    returnWithError("Username is required");
    exit();
}

// Load the .env file
$env = parse_ini_file('./../.env');
if ($env === false) {
    returnWithError("Failed to load .env file");
    exit();
}

$servername = $env["SERVER_NAME"] ?? null;
$dbUsername = $env["DB_USERNAME"] ?? null;
$dbPassword = $env["DB_PASSWORD"] ?? null;
$dbName = $env["DB_NAME"] ?? null;

// Connect to database
$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbName);
if ($conn->connect_error) {
    returnWithError($conn->connect_error);
    exit();
}

// Check if username exists
$stmt = $conn->prepare("SELECT ID FROM USERS WHERE USER = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Username already exists
    $response = [
        "available" => false,
        "message" => "Username already taken"
    ];
} else {
    // Username is available
    $response = [
        "available" => true,
        "message" => "Username available"
    ];
}

$stmt->close();
$conn->close();

echo json_encode($response);

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function returnWithError($err)
{
    $response = [
        "available" => false,
        "message" => $err
    ];
    echo json_encode($response);
    exit();
}
?> 