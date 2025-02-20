<?php
	
    // Load the .env file
    $env = parse_ini_file('.env');

    $servername = $env["SERVER_NAME"];
    $dbUsername = $env["DB_USERNAME"];
    $dbPassword = $env["DB_PASSWORD"];
    $dbName = $env["DB_NAME"];

    //Check for id
    if (!isset($_GET["CONTACT_ID"]))
    {
        returnwithError("Missing contactID");
    }


    //get contact id
    $contactID = intval($_GET["CONTACT_ID"]);

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

                returnWithInfo($contactID, $firstName, $lastName, $email, $phone , $response);
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