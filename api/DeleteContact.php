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

//Variable data from input
$contactID = $inData["CONTACT_ID"];

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
	ID: int -> selected by the user
	FIRST: str
	LAST: str
	EMAIL: str
	PHONE_NUMBER: str
	USER_ID: int
}
*/

$conn = mysqli_init();
if (!$conn) {
	returnWithError("mysqli_init failed");
	exit();
}

if (!$conn->real_connect($servername, $dbUsername, $dbPassword, $dbName)) {
	returnWithError("Connection failed: " . $conn->connect_error . " (" . $conn->connect_errno . ")");
	exit();
}

$stmt = $conn->prepare("DELETE from CONTACTS where ID = ?");
$stmt->bind_param("i", $contactID);

$stmt->execute();
$stmt->close();
$conn->close();
returnWithError("");

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