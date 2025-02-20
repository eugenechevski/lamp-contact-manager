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

    //Check for id
    if (!$contactID)
    {
        returnwithError("Missing contactID");
    }

    $firstName = $inData["FIRST"];
    $lastName = $inData["LAST"];
    $email = $inData["EMAIL"];
    $phone = $inData["PHONE_NUMBER"];

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
	$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbName);
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
        updateContact($contactID, $firstName, $lastName, $email, $phone);

		$conn->close();
		//returnWithError("");
	}

    function updateContact($contactID, $firstName, $lastName, $email, $phone)
    {
        global $conn;
    
        $updates = [];
        $params = [];
        $types = "";

        //Support optional parameters
        if ($firstName !== null) 
            { 
                $updates[] = "FIRST = ?"; $params[] = $firstName; $types .= "s"; 
            }
        if ($lastName !== null) 
            { 
            $updates[] = "LAST = ?"; $params[] = $lastName; $types .= "s"; 
            }
        if ($email !== null) 
            { 
                $updates[] = "EMAIL = ?"; $params[] = $email; $types .= "s"; 
            }
        if ($phone !== null) 
            { 
                $updates[] = "PHONE_NUMBER = ?"; $params[] = $phone; $types .= "s"; 
            }

        $params[] = $contactID;
        $types .= "i";

        if (empty($updates)) 
        {
            returnWithError("No fields provided.");
            return;
        }

        //combine parameters into request
        $request = "UPDATE CONTACTS SET " . implode(", ", $updates) . " WHERE ID = ?";

        $stmt = $conn->prepare($request);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute())
        {
            $response["success"] = true;
		    echo json_encode($response);
        }
        else
        {
            $response["success"] = false;
            echo json_encode($response);
            returnWithError("Failed to update contact.");
        }

        $stmt->close();

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