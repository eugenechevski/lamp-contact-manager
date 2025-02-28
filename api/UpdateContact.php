<?php
    // Start the session to get the user ID
    session_start();
    
    // Check if user is logged in
    if (!isset($_SESSION["USER_ID"])) {
        $response = array("success" => false, "message" => "User not logged in");
        echo json_encode($response);
        exit();
    }

    //Input data
	$inData = getRequestInfo();

    // Check if we have valid input data
    if ($inData === null) {
        $response = array("success" => false, "message" => "Invalid JSON data received");
        echo json_encode($response);
        exit();
    }

    // Load the .env file
    $env = parse_ini_file('./../.env');
    //$env = parse_ini_file('.env');

    $servername = $env["SERVER_NAME"];
    $dbUsername = $env["DB_USERNAME"];
    $dbPassword = $env["DB_PASSWORD"];
    $dbName = $env["DB_NAME"];
	
    // Get current user ID from session
    $userID = $_SESSION["USER_ID"];
    
    //Variable data from input
    $contactID = isset($inData["CONTACT_ID"]) ? $inData["CONTACT_ID"] : null;

    //Check for id
    if (!$contactID)
    {
        $response = array("success" => false, "message" => "Missing contactID");
        echo json_encode($response);
        exit();
    }

    $firstName = isset($inData["FIRST"]) ? $inData["FIRST"] : null;
    $lastName = isset($inData["LAST"]) ? $inData["LAST"] : null;
    $email = isset($inData["EMAIL"]) ? $inData["EMAIL"] : null;
    $phone = isset($inData["PHONE_NUMBER"]) ? $inData["PHONE_NUMBER"] : null;

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
        $response = array("success" => false, "message" => $conn->connect_error);
        echo json_encode($response);
        exit();
	} 
	else
	{
        // Verify that the contact belongs to the current user
        $stmt = $conn->prepare("SELECT * FROM CONTACTS WHERE ID = ? AND USER_ID = ?");
        $stmt->bind_param("ii", $contactID, $userID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $response = array("success" => false, "message" => "Contact not found or you don't have permission to edit it");
            echo json_encode($response);
            $stmt->close();
            $conn->close();
            exit();
        }
        $stmt->close();
        
        // Proceed with update
        updateContact($contactID, $firstName, $lastName, $email, $phone);
		$conn->close();
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
            $response = array("success" => false, "message" => "No fields provided for update");
            echo json_encode($response);
            return;
        }

        //combine parameters into request
        $request = "UPDATE CONTACTS SET " . implode(", ", $updates) . " WHERE ID = ?";

        $stmt = $conn->prepare($request);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute())
        {
            $response = array("success" => true, "message" => "Contact updated successfully");
            echo json_encode($response);
        }
        else
        {
            $response = array("success" => false, "message" => "Failed to update contact: " . $stmt->error);
            echo json_encode($response);
        }

        $stmt->close();
    }

	function getRequestInfo()
	{
        $data = file_get_contents('php://input');
        return json_decode($data, true);
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