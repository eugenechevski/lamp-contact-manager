<?php
    //Input data
	$inData = getRequestInfo();
	
    //Variable data from input
    $contactID = $inData["contactID"];

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
	$conn = new mysqli("localhost", "", "", "");
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

                returnWithInfo($contactID, $firstName, $lastName, $email, $phone);
            }
            else
            {
                returnWithError("Contact not found.");
            }
        }

		$stmt->close();
		$conn->close();
		returnWithError("");
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

    function returnWithInfo( $id, $firstName, $lastName, $email, $phone)
	{
		$retValue = json_encode([
            "id" => $contactID,
            "first" => $firstName,
            "last" => $lastName,
            "email" => $listOfContacts, 
            "phone" => $phone,
            "error" => ""
        ]);
        sendResultInfoAsJson( $retValue );
	}
	
?>