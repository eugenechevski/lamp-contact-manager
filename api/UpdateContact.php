<?php
    //Input data
	$inData = getRequestInfo();
	
    //Variable data from input
    //Assumed Names
    $contactID = $inData["contactID"];
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
	$conn = new mysqli("localhost", "", "", "");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
        updateContact($contactID, $firstName, $lastName, $email, $phone);

		$stmt->close();
		$conn->close();
		returnWithError("");
	}

    //Update function with optional parameters
    function updateContact($contactID, $firstName = null, $lastName = null, $email = null, $phone = null)
    {
        $stmt = $conn->prepare("UPDATE CONTACTS SET FIRST = :firstName, LAST = :lastName, EMAIL = :email, PHONE_NUMBER = :phone WHERE contactID = :contactID");
        $stmt->bind_param(:firstName, $firstName);
        $stmt->bind_param(:lastName, $lastName);
        $stmt->bind_param(:email, $email);
        $stmt->bind_param(:phone, $phone);

        $stmt->execute();

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