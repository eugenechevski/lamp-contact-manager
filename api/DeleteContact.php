<?php
    //Input data
	$inData = getRequestInfo();
	
	// Load the .env file
    $env = parse_ini_file('.env');

    $servername = $env["SERVER_NAME"];
    $dbUsername = $env["DB_USERNAME"];
    $dbPassword = $env["DB_PASSWORD"];
    $dbName = $env["DB_NAME"];

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

    //Default credentials
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