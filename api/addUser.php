<?php

$inData = getRequestInfo();

// Load the .env file
$env = parse_ini_file('./../.env');
if ($env === false) {
	returnWithError("Failed to load .env file", FALSE);
	exit();
}

$servername = $env["SERVER_NAME"] ?? null;
$dbUsername = $env["DB_USERNAME"] ?? null;
$dbPassword = $env["DB_PASSWORD"] ?? null;
$dbName = $env["DB_NAME"] ?? null;

if (!$servername || !$dbUsername || !$dbPassword || !$dbName) {
	returnWithError("Missing database configuration", FALSE);
	exit();
}

$firstName = $inData["FIRST"];
$lastName = $inData["LAST"];
$username = $inData["USER"];
$password = $inData["PASSWORD"];

$conn = mysqli_init();
if (!$conn) {
	returnWithError("mysqli_init failed", FALSE);
	exit();
}

if (!$conn->real_connect($servername, $dbUsername, $dbPassword, $dbName)) {
	returnWithError("Connection failed: " . $conn->connect_error . " (" . $conn->connect_errno . ")", FALSE);
	exit();
}

$stmt = $conn->prepare("INSERT into USERS (FIRST,LAST,USER,PASSWORD) VALUES (?,?,?,?)");
$stmt->bind_param("ssss", $firstName, $lastName, $username, $password);
$stmt->execute();
$stmt->close();
$conn->close();

returnWithError("", TRUE);

function getRequestInfo()
{
	return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj)
{
	header('Content-type: application/json');
	echo $obj;
}

function returnWithError($err, $success)
{
	$retValue = json_encode([
		"error" => $err,
		"success" => $success
	]);
	sendResultInfoAsJson($retValue);
}

?>