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
        $stmt = $conn->prepare("DELETE from CONTACTS where ID = ?");
		$stmt->bind_param("i", $contactID);

		if (!$stmt->execute()):
            returnwithError("Failed to delete contact.");

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
	
?>