<?php

//Input data
$inData = getRequestInfo();

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

$contactID = $inData["CONTACT_ID"];

//Check for id
if (!$contactID) {
    returnwithError("Missing contactID");
    exit();
}

$firstName = $inData["FIRST"];
$lastName = $inData["LAST"];
$email = $inData["EMAIL"];
$phone = $inData["PHONE_NUMBER"];

$conn = mysqli_init();
if (!$conn) {
    returnWithError("mysqli_init failed");
    exit();
}

if (!$conn->real_connect($servername, $dbUsername, $dbPassword, $dbName)) {
    returnWithError("Connection failed: " . $conn->connect_error . " (" . $conn->connect_errno . ")");
    exit();
}

/*
Database Table Content Assumptions

User: {
    ID: int
    FIRST: str
    LAST: str
    USER: str
    PASSWORD: str
}

Contact: {
    ID: int
    FIRST: str
    LAST: str
    EMAIL: str
    PHONE_NUMBER: str
    USER_ID: int
}
*/

//Default credentials
$conn = new mysqli("localhost", "root", "", "contact_manager");
if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    updateContact($contactID, $firstName, $lastName, $email, $phone);

    $stmt->close();
    $conn->close();
    returnWithError("");
}

function updateContact($contactID, $firstName, $lastName, $email, $phone)
{
    global $conn;

    $updates = [];
    $params = [];
    $types = "";

    //Support optional parameters
    if ($firstName !== null) {
        $updates[] = "FIRST = ?";
        $params[] = $firstName;
        $types .= "s";
    }
    if ($lastName !== null) {
        $updates[] = "LAST = ?";
        $params[] = $lastName;
        $types .= "s";
    }
    if ($email !== null) {
        $updates[] = "EMAIL = ?";
        $params[] = $email;
        $types .= "s";
    }
    if ($phone !== null) {
        $updates[] = "PHONE_NUMBER = ?";
        $params[] = $phone;
        $types .= "s";
    }

    $params[] = $contactID;
    $types .= "i";

    if (empty($updates)) {
        returnWithError("No fields provided.");
        return;
    }

    //combine parameters into request
    $request = "UPDATE CONTACTS SET " . implode(", ", $updates) . " WHERE ID = ?";

    $stmt = $conn->prepare($request);
    $stmt->bind_param($types, ...$params);

    $stmt->execute();

}

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj)
{
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError($err)
{
    $retValue = '{"error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

?>