<?php
	
    // Load the .env file
    $env = parse_ini_file('./../.env');
    //$env = parse_ini_file('.env');

    $servername = $env["SERVER_NAME"];
    $dbUsername = $env["DB_USERNAME"];
    $dbPassword = $env["DB_PASSWORD"];
    $dbName = $env["DB_NAME"];


    //get contact id
    $contactID = intval($_GET["contact_ID"]);

    //var_dump($contactID);

    //Default credentials
	$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbName);
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
        $stmt = $conn->prepare("SELECT FIRST, LAST, EMAIL, PHONE_NUMBER from CONTACTS where ID = ?");
		$stmt->bind_param("i", $contactID);

		if (!$stmt->execute())
        {
            returnwithError("Failed to retrieve contact information.");
        }
        else
        {
            $result = $stmt->get_result();
            if ($contact = $result->fetch_assoc())
            {
                $firstName = $contact["FIRST"];
                $lastName = $contact["LAST"];
                $email = $contact["EMAIL"];
                $phone = $contact["PHONE_NUMBER"];
                $response["success"] = true;

                returnWithInfo($contactID, $firstName, $lastName, $email, $phone, $response);
            }
            else
            {
                $response["success"] = false;
                returnWithError("Contact not found.");
            }
        }

		$stmt->close();
		$conn->close();
		//returnWithError("");
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

    function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}

    function returnWithInfo( $id, $firstName, $lastName, $email, $phone, $response)
	{
		$retValue = json_encode([
            "response" => 
            [
                "success" => true,
                "id" => $id,
                "first" => $firstName,
                "last" => $lastName,
                "email" => $email,
                "phone" => $phone,
                "error" => ""
            ]
        ]);

        sendResultInfoAsJson( $retValue );

	}
	
?>