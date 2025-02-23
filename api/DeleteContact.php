<?php

//Input data
$inData = getRequestInfo();

//Variable data from input
$contactID = $inData["CONTACT_ID"];

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

	$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbName);
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
        $stmt = $conn->prepare("DELETE from CONTACTS where ID = ?");
		$stmt->bind_param("i", $contactID);

		if($stmt->execute())
		{
			$response["success"] = true;
		}
		else
		{
			$response["success"] = false;
		}

		$stmt->close();
		$conn->close();
		echo json_encode($response);
		//returnWithError("");
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
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