<?php
// Start the session to get the user ID
session_start();

// Check if user is logged in
if (!isset($_SESSION["USER_ID"])) {
    $response = array("success" => false, "message" => "User not logged in");
    echo json_encode($response);
    exit();
}

// Get current user ID from session
$userID = $_SESSION["USER_ID"];

// Get search query from request
$inData = getRequestInfo();
$searchTerm = isset($inData["search"]) ? $inData["search"] : "";

// If search term is empty, return all contacts
if (empty($searchTerm)) {
    // Redirect to RetrieveContact.php to get all contacts
    header("Location: RetrieveContact.php");
    exit();
}

// Load the .env file
$env = parse_ini_file('./../.env');
if ($env === false) {
    $response = array("success" => false, "message" => "Failed to load .env file");
    echo json_encode($response);
    exit();
}

$servername = $env["SERVER_NAME"] ?? null;
$dbUsername = $env["DB_USERNAME"] ?? null;
$dbPassword = $env["DB_PASSWORD"] ?? null;
$dbName = $env["DB_NAME"] ?? null;

// Connect to database
$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbName);
if ($conn->connect_error) {
    $response = array("success" => false, "message" => $conn->connect_error);
    echo json_encode($response);
    exit();
}

// Prepare search query with LIKE for partial matches
// Search in first name, last name, email, and phone number
$searchTerm = "%$searchTerm%"; // Add wildcards for LIKE query
$stmt = $conn->prepare("SELECT ID, FIRST, LAST, EMAIL, PHONE_NUMBER FROM CONTACTS 
                        WHERE USER_ID = ? AND 
                        (FIRST LIKE ? OR LAST LIKE ? OR EMAIL LIKE ? OR PHONE_NUMBER LIKE ?)
                        ORDER BY LAST, FIRST");

$stmt->bind_param("issss", $userID, $searchTerm, $searchTerm, $searchTerm, $searchTerm);

if (!$stmt->execute()) {
    $response = array("success" => false, "message" => "Failed to search contacts: " . $stmt->error);
    echo json_encode($response);
    $stmt->close();
    $conn->close();
    exit();
}

$result = $stmt->get_result();
$contacts = array();

while ($row = $result->fetch_assoc()) {
    $contacts[] = array(
        "id" => $row["ID"],
        "first" => $row["FIRST"],
        "last" => $row["LAST"],
        "name" => $row["FIRST"] . " " . $row["LAST"],
        "email" => $row["EMAIL"],
        "phone" => $row["PHONE_NUMBER"]
    );
}

$response = array(
    "success" => true,
    "contacts" => $contacts
);

echo json_encode($response);
$stmt->close();
$conn->close();

function getRequestInfo()
{
    $data = file_get_contents('php://input');
    return json_decode($data, true);
}
?> 