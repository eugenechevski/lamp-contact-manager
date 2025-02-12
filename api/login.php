
<?php

	$inData = getRequestInfo();

    // server, DB username, DB password, DB name 
	$conn = new mysqli("localhost", "", "", ""); 	
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
            selfContactID: int
        }

        Contact: {
            ID: int
            firstName: str
            lastName: str
            email: str
            phoneNumber: int / str (?)
        }

        (Junction Table / Many-to-Many)
        UserContacts: {
            UserID: int
            ContactID: int
        }
        */

        // Retrieve the selfContact, which holds UserID and selfContactID of the user in Contacts table
        $stmt = $conn->prepare("SELECT ID,selfContactID FROM Users WHERE Login=? AND Password =?");

		$stmt->bind_param("ss", $inData["login"], $inData["password"]);
        $stmt->execute();
		$result = $stmt->get_result();

		if( $row = $result->fetch_assoc()  )
		{
			$userID = $row["ID"];
            $selfContactID = $row["selfContactID"];
            
            // Retrieve selfContact details from Contacts table
            // selfContactID should be normal ID in contacts table
            $selfStmt = $conn->prepare("SELECT ID, firstName, lastName, email, phoneNumber FROM Contacts WHERE ID=?");
            $selfStmt->bind_param("i", $selfContactID);
            $selfStmt->execute();
            $selfResult = $selfStmt->get_result();

            $listOfContacts = [];
            
            if ($selfContact = $selfResult->fetch_assoc()) {
                
                // Retrieve and form listOfContacts using the junction table of Users and Contacts
                // Assumes junction table is recording all UserID and ContactID relationships
                $contactsStmt = $conn->prepare(
                    "SELECT c.ID, c.firstName, c.lastName, c.email, c.phoneNumber FROM Contacts c 
                    INNER JOIN UserContacts uc ON c.ID = uc.contactID 
                    WHERE uc.userID = ?"
                );

                $contactsStmt->bind_param("i", $userID);
                $contactsStmt->execute();
                $contactsResult = $contactsStmt->get_result();
                
                while ($contact = $contactsResult->fetch_assoc()) {
                    $listOfContacts[] = $contact;
                }
                
                returnWithInfo($selfContact, $listOfContacts);
                
                $contactsStmt->close();
            }
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
        $retValue = '{"id":0,"selfContact":null,"listOfContacts":[]","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $selfContact, $listOfContacts )
	{
		$retValue = '{"id":' . $id . ',"selfContact":"' . $firstName . '","listOfContacts":"' . $listOfContacts . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
