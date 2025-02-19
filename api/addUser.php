
<?php

	$inData = getRequestInfo();

  // Load the .env file
  $env = parse_ini_file('.env');

  $servername = $env["SERVER_NAME"];
  $dbUsername = $env["DB_USERNAME"];
  $dbPassword = $env["DB_PASSWORD"];
  $dbName = $env["DB_NAME"];

  //$servername = "localhost";
  //$dbUsername = "root";
  //$dbPassword = "";
  //$dbName = "contact_manager";

  $firstName = $inData["FIRST"];
  $lastName = $inData["LAST"];
	$username = $inData["USER"];
  $password = $inData["PASSWORD"];

  // For testing
  // $firstName = "";
  // $lastName = "";
	// $username = "";
  // $password = "";

    // server, DB username, DB password, DB name 
	$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbName); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
        $stmt = $conn->prepare("INSERT into USERS (FIRST,LAST,USER,PASSWORD) VALUES (?,?,?,?)");
		$stmt->bind_param("ssss", $firstName, $lastName, $username, $password);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		$response["success"] = true;
		echo json_encode($response);
		//returnWithError("");
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
            "error" => $err
        ]);
		sendResultInfoAsJson( $retValue );
	}
	
?>