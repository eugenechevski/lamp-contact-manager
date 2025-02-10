<?php
    //Input data
	$inData = getRequestInfo();
	
    //Variable data from input
    //Assumed Names
    $userID = $inData["userID"];
    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"];
    $email = $inData["email"];
    $phone = $inData["phone"];

    //Check for missing fields(?)

    //Default credentials
	$conn = new mysqli("localhost", "", "", "");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
        //Get selfcontactID from userID
        $stmt = $conn->prepare("SELECT selfContactID FROM User WHERE ID = ?");
        $stmt->bind_param("i", $userID);
        $stmt->execute();
        $result = $stmt->get_result();
        if( $row = $result->fetch_assoc()  )
		{
            $selfContactID = $row["selfContactID"];

            //Check if user is adding themselves
            $selfstmt = $conn->prepare("SELECT ID FROM Contact WHERE firstName = ? AND lastName = ? AND email = ? AND phone = ? LIMIT 1");
            $selfstmt->bind_param("ssss", $firstName, $lastName, $email, $phone);
            $selfstmt->execute();
            $selfstmt->bind_result($existContactID);
            $selfstmt->fetch();
            $selfstmt->close();

            if ($existContactID)
            {
                if ($existContactID == $selfContactID)
                {
                    returnWithError("Cannot add self as contact.")
                }
    
                //Check if contact is already linked to user
                $selfstmt = $conn->prepare("SELECT 1 FROM UserContacts WHERE UserID = ? AND ContactID = ?");
                $selfstmt->bind_param("ii", $userID, $existContactID);
                $selfstmt->execute();
                $selfstmt->store_result();
    
                if ($selfstmt->num_rows > 0)
                {
                    returnWithError("Contact is already linked to user.")
                }
    
                //Link existing contact to user
                $selfstmt = $conn->prepare("INSERT into UserContacts (UserID, ContactID) VALUES(?,?)");
                $selfstmt->bind_param("ii", $userID, $existContactID);
                $selfstmt->execute();
    
                //Create new contact
                $selfstmt = $conn->prepare("INSERT into Contacts (FirstName, LastName, Email, Phone) VALUES(?,?,?,?)");
                $selfstmt->bind_param("ssss", $firstName, $lastName, $email, $phone);
                $selfstmt->execute();

                //Bind to user
                if ($selfstmt->execute())
                {
                    $contactID = $stmt->insert_id; //inserted contact id
                    $linkstmt = $conn->prepare("INSERT into UserContacts (UserID, ContactID) VALUES(?,?)");
                    $linkstmt->bind_param("ii", $userID, $contactID);
                    $linkstmt->execute();
                    $linkstmt->close();
                }
                else
                {
                    returnWithError("Failed to create contact.");
                }

                $selfstmt->close();

            }

        }
        else
        {
            returnWithError("User Not Found");
        }
        
		$stmt->close();
		$conn->close();
		returnWithError("");
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