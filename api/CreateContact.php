<?php
    // Start the session to get the user ID
    session_start();
    
    // Check if user is logged in
    if (!isset($_SESSION["USER_ID"])) {
        $response = array("success" => false, "message" => "User not logged in");
        echo json_encode($response);
        exit();
    }
    
    // Input data
    $inData = getRequestInfo();

    // Load the .env file
    $env = parse_ini_file('./../.env');

    $servername = $env["SERVER_NAME"];
    $dbUsername = $env["DB_USERNAME"];
    $dbPassword = $env["DB_PASSWORD"];
    $dbName = $env["DB_NAME"];

    // Get current user ID from session
    $userID = $_SESSION["USER_ID"];

    // Check if we have valid input data
    if ($inData === null) {
        $response = array("success" => false, "message" => "Invalid JSON data received");
        echo json_encode($response);
        exit();
    }

    // Variable data from input
    $firstName = $inData["FIRST"];
    $lastName = $inData["LAST"];
    $email = $inData["EMAIL"];
    $phone = $inData["PHONE_NUMBER"];

    //Default credentials
	$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbName);
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
        createContact($firstName, $lastName, $email, $phone, $userID);

		$conn->close();
		//returnWithError("");
	}

    function createContact($firstName, $lastName, $email, $phone, $userID)
    {
        global $conn;
    
        // Validate required fields
        if (empty($firstName) || empty($lastName) || empty($email)) {
            $response = array("success" => false, "message" => "First name, last name, and email are required");
            echo json_encode($response);
            return;
        }

        // Prepare the SQL statement
        $stmt = $conn->prepare("INSERT INTO CONTACTS (FIRST, LAST, EMAIL, PHONE_NUMBER, USER_ID) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssi", $firstName, $lastName, $email, $phone, $userID);
        
        // Execute the statement
        if ($stmt->execute()) {
            $response = array("success" => true, "message" => "Contact created successfully");
            echo json_encode($response);
        } else {
            $response = array("success" => false, "message" => "Failed to add contact: " . $stmt->error);
            echo json_encode($response);
        }
        
        $stmt->close();
    }

    function getRequestInfo()
    {
        $data = file_get_contents('php://input');
        return json_decode($data, true);
    }

    function sendResultInfoAsJson($obj)
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError($err)
    {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }
?>