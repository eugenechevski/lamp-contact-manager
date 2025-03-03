<?php

$inData = getRequestInfo();

// Load the .env file
$env = parse_ini_file('./../.env');

$servername = $env["SERVER_NAME"];
$dbUsername = $env["DB_USERNAME"];
$dbPassword = $env["DB_PASSWORD"];
$dbName = $env["DB_NAME"];

$firstName = $inData["FIRST"];
$lastName = $inData["LAST"];
$username = $inData["USER"];
$password = $inData["PASSWORD"];

// server, DB username, DB password, DB name 
$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbName);
if ($conn->connect_error) {
	returnWithError($conn->connect_error, FALSE);
} else {
	// Check if username already exists
	$checkStmt = $conn->prepare("SELECT ID FROM USERS WHERE USER = ?");
	$checkStmt->bind_param("s", $username);
	$checkStmt->execute();
	$result = $checkStmt->get_result();
	
	if ($result->num_rows > 0) {
		// Username already exists
		$checkStmt->close();
		$conn->close();
		returnWithError("Username already exists. Please choose a different username.", FALSE);
	} else {
		// Username is available, proceed with account creation
		$checkStmt->close();
		
		$stmt = $conn->prepare("INSERT into USERS (FIRST,LAST,USER,PASSWORD) VALUES (?,?,?,?)");
		$stmt->bind_param("ssss", $firstName, $lastName, $username, $password);
		$stmt->execute();
		$stmt->close();
		
		// Get the inserted user ID
		$userId = $conn->insert_id;
		$conn->close();

		// Save the user in session
		session_start();
		$_SESSION["USER"] = $username;
		$_SESSION["PASSWORD"] = $password;
		$_SESSION["USER_ID"] = $userId;

		returnWithError("", TRUE);
	}
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

function returnWithError($err, $success)
{
	$retValue = json_encode([
		"error" => $err,
		"success" => $success
	]);
	sendResultInfoAsJson($retValue);
}

?>