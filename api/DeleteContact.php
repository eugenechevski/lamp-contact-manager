<?php
// Start the session to get the user ID
session_start();

// Check if user is logged in
if (!isset($_SESSION["USER_ID"])) {
	$response = array("success" => false, "message" => "User not logged in");
	echo json_encode($response);
	exit();
}

// Input data
$inData = getRequestInfo();

// Check if we have valid input data
if ($inData === null) {
	$response = array("success" => false, "message" => "Invalid JSON data received");
	echo json_encode($response);
	exit();
}

// Variable data from input
$contactID = isset($inData["CONTACT_ID"]) ? $inData["CONTACT_ID"] : null;

// Check for required contactID
if (!$contactID) {
	$response = array("success" => false, "message" => "Missing contactID");
	echo json_encode($response);
	exit();
}

// Get current user ID from session
$userID = $_SESSION["USER_ID"];

// Load the .env file
$env = parse_ini_file('./../.env');
//$env = parse_ini_file('.env');
if ($env === false) {
	$response = array("success" => false, "message" => "Failed to load .env file");
	echo json_encode($response);
	exit();
}

$servername = $env["SERVER_NAME"] ?? null;
$dbUsername = $env["DB_USERNAME"] ?? null;
$dbPassword = $env["DB_PASSWORD"] ?? null;
$dbName = $env["DB_NAME"] ?? null;

	$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbName);
	if ($conn->connect_error) 
	{
		$response = array("success" => false, "message" => $conn->connect_error);
		echo json_encode($response);
		exit();
	} 
	else
	{
		// Verify that the contact belongs to the current user
		$stmt = $conn->prepare("SELECT * FROM CONTACTS WHERE ID = ? AND USER_ID = ?");
		$stmt->bind_param("ii", $contactID, $userID);
		$stmt->execute();
		$result = $stmt->get_result();
		
		if ($result->num_rows === 0) {
			$response = array("success" => false, "message" => "Contact not found or you don't have permission to delete it");
			echo json_encode($response);
			$stmt->close();
			$conn->close();
			exit();
		}
		$stmt->close();
		
		// Proceed with deletion
		$stmt = $conn->prepare("DELETE from CONTACTS where ID = ? AND USER_ID = ?");
		$stmt->bind_param("ii", $contactID, $userID);

		if($stmt->execute())
		{
			$response = array("success" => true, "message" => "Contact deleted successfully");
		}
		else
		{
			$response = array("success" => false, "message" => "Failed to delete contact: " . $stmt->error);
		}

		$stmt->close();
		$conn->close();
		echo json_encode($response);
		//returnWithError("");
	}

	function getRequestInfo()
	{
		$data = file_get_contents('php://input');
		return json_decode($data, true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

?>