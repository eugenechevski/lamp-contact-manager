<?php
    //Input data
	$inData = getRequestInfo();

    // Load the .env file
    $env = parse_ini_file('./../.env');

    //$env = parse_ini_file('.env');

    $servername = $env["SERVER_NAME"];
    $dbUsername = $env["DB_USERNAME"];
    $dbPassword = $env["DB_PASSWORD"];
    $dbName = $env["DB_NAME"];

    //Variable data from input
    $userID = $inData["USER_ID"];
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
    
        $updates = [];
        $params = [];
        $qmarks = [];
        $types = "";

        //Support optional parameters
        if ($firstName !== null) 
            { 
                $updates[] = "FIRST"; $params[] = $firstName; $qmarks[] = "?"; $types .= "s"; 
            }
        else
        {
            $response["success"] = false;
        }
        if ($lastName !== null) //Needs a separate field in the frontend
            { 
            $updates[] = "LAST"; $params[] = $lastName; $qmarks[] = "?"; $types .= "s"; 
            }
        else
        {
            $response["success"] = false;
        }
        if ($email !== null) 
            { 
                $updates[] = "EMAIL"; $params[] = $email; $qmarks[] = "?"; $types .= "s"; 
            }
        else
        {
            $response["success"] = false;
        }
        if ($phone !== null) 
            { 
                $updates[] = "PHONE_NUMBER"; $params[] = $phone; $qmarks[] = "?"; $types .= "s"; 
            }

        $params[] = $userID;
        $qmarks[] = "?";
        $updates[] = "USER_ID";
        $types .= "i";

        if (empty($updates)) {
            returnWithError("No fields provided.");
            $response["success"] = false;
            return;
        }

        //combine parameters into request
        $request = "INSERT into CONTACTS (" . implode(", ", $updates) . ") VALUES(" . implode(",", $qmarks) . ")";

        $stmt = $conn->prepare($request);
        $stmt->bind_param($types, ...$params);

        $stmt->execute();
        if ($stmt->execute())
        {
            $response["success"] = true;
		    echo json_encode($response);
        }
        else
        {
            $response["success"] = false;
            echo json_encode($response);
            returnWithError("Failed to add contact.");
        }
        $stmt->close();

    }

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
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