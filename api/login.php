<?php

	$inData = getRequestInfo();

  // Load the .env file
  $env = parse_ini_file('.env');

  $servername = $env["SERVER_NAME"];
  $dbUsername = $env["DB_USERNAME"];
  $dbPassword = $env["DB_PASSWORD"];
  $dbName = $env["DB_NAME"];
    
    // server, DB username, DB password, DB name 
	$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbName);	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{

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

        // Retrieve the Users information based on login info
        $stmt = $conn->prepare("SELECT ID,FIRST,LAST FROM USERS WHERE USER=? AND PASSWORD=?");

        // For Testing
        // $testUser = "asmith";
        // $testPassword = "password1";
        // $stmt->bind_param("ss", $testUser, $testPassword);    

		$stmt->bind_param("ss", $inData["USER"], $inData["PASSWORD"]);

        $stmt->execute();
		$result = $stmt->get_result();

		if( $row = $result->fetch_assoc()  )
		{
			$userID = $row["ID"];
            $firstName = $row["FIRST"];
            $lastName = $row["LAST"];

            $listOfContacts = [];
                
            // Form the list of contacts by iterating through Contacts table, and finding all that have the correct USER_ID field
            $contactsStmt = $conn->prepare(
                "SELECT ID, FIRST, LAST, EMAIL, PHONE_NUMBER FROM CONTACTS WHERE USER_ID = ?"
            );

            $contactsStmt->bind_param("i", $userID);
            $contactsStmt->execute();
            $contactsResult = $contactsStmt->get_result();
            
            while ($contact = $contactsResult->fetch_assoc()) {
                $listOfContacts[] = $contact;
            }
            
            returnWithInfo($userID, $firstName, $lastName, $listOfContacts);
            
            $contactsStmt->close();
		}
		else
		{
			returnWithError("User Not Found");
		}

		$stmt->close();
		$conn->close();
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
        $retValue = json_encode([
            "id" => 0,
            "first" => "",
            "last" => "",
            "listOfContacts" => [],
            "error" => $err
        ]);
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $id, $firstName, $lastName, $listOfContacts )
	{
		$retValue = json_encode([
            "id" => $id,
            "first" => $firstName,
            "last" => $lastName,
            "listOfContacts" => $listOfContacts, 
            "error" => ""
        ]);
        sendResultInfoAsJson( $retValue );
	}
	
?>
