<?php

// Start session
session_start();

// Check if user is logged in
if (!isset($_SESSION["USER_ID"])) {
    returnWithError("User not logged in");
    exit();
}

// Get user ID from session
$userID = $_SESSION["USER_ID"];

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

if (!$servername || !$dbUsername || !$dbPassword || !$dbName) {
    returnWithError("Missing database configuration");
    exit();
}

// server, DB username, DB password, DB name 
$conn = mysqli_init();
if (!$conn) {
    returnWithError("mysqli_init failed");
    exit();
}

if (!$conn->real_connect($servername, $dbUsername, $dbPassword, $dbName)) {
    returnWithError("Connection failed: " . $conn->connect_error . " (" . $conn->connect_errno . ")");
    exit();
}

// Retrieve the Users information based on user ID
$stmt = $conn->prepare("SELECT ID, FIRST, LAST FROM USERS WHERE ID = ?"); 
$stmt->bind_param("i", $userID);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $firstName = $row["FIRST"];
    $lastName = $row["LAST"];

    $listOfContacts = [];

    // Form the list of contacts by iterating through Contacts table, and finding all that have the correct USER_ID field
    $contactsStmt = $conn->prepare(
        "SELECT ID, FIRST, LAST, EMAIL, PHONE_NUMBER FROM CONTACTS WHERE USER_ID = ?"
    );

    $contactsStmt->bind_param("i", $userID);
    $contactsStmt->execute();
    $contactsResult = $contactsStmt->get_result();

    while ($contact = $contactsResult->fetch_assoc()) {
        $listOfContacts[] = $contact;
    }

    returnWithInfo($userID, $firstName, $lastName, $listOfContacts);

    $contactsStmt->close();
} else {
    returnWithError("User Not Found");
}

$stmt->close();
$conn->close();

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj)
{
    header('Content-type: application/json');
    echo $obj;
    echo "\n";
}

function returnWithError($err)
{
    $retValue = json_encode([
        "id" => 0,
        "first" => "",
        "last" => "",
        "listOfContacts" => [],
        "error" => $err,
        "success" => FALSE
    ]);
    sendResultInfoAsJson($retValue);
}

function returnWithInfo($id, $firstName, $lastName, $listOfContacts)
{
    $retValue = json_encode([
        "id" => $id,
        "first" => $firstName,
        "last" => $lastName,
        "listOfContacts" => $listOfContacts,
        "error" => "",
        "success" => TRUE
    ]);
    sendResultInfoAsJson($retValue);
}

?>