<?php
    // Start the session to get the user ID
    session_start();
    
    // Check if user is logged in
    if (!isset($_SESSION["USER_ID"])) {
        $response = array("success" => false, "message" => "User not logged in");
        echo json_encode($response);
        exit();
    }

    // Get current user ID from session
    $userID = $_SESSION["USER_ID"];
	
    // Load the .env file
    $env = parse_ini_file('./../.env');
    //$env = parse_ini_file('.env');

    $servername = $env["SERVER_NAME"];
    $dbUsername = $env["DB_USERNAME"];
    $dbPassword = $env["DB_PASSWORD"];
    $dbName = $env["DB_NAME"];

    // Check if we're retrieving a single contact or all contacts
    if (isset($_GET["id"])) {
        // Get contact id
        $contactID = intval($_GET["id"]);
        getSingleContact($contactID, $userID);
    } else {
        // Get all contacts for the current user
        getAllContacts($userID);
    }

    function getSingleContact($contactID, $userID) {
        global $conn, $servername, $dbUsername, $dbPassword, $dbName;

        // Default credentials
        $conn = new mysqli($servername, $dbUsername, $dbPassword, $dbName);
        if ($conn->connect_error) {
            $response = array("success" => false, "message" => $conn->connect_error);
            echo json_encode($response);
            exit();
        } else {
            // Verify that the contact belongs to the current user
            $stmt = $conn->prepare("SELECT ID, FIRST, LAST, EMAIL, PHONE_NUMBER FROM CONTACTS WHERE ID = ? AND USER_ID = ?");
            $stmt->bind_param("ii", $contactID, $userID);

            if (!$stmt->execute()) {
                $response = array("success" => false, "message" => "Failed to retrieve contact information");
                echo json_encode($response);
            } else {
                $result = $stmt->get_result();
                if ($contact = $result->fetch_assoc()) {
                    $response = array(
                        "success" => true,
                        "contact" => array(
                            "id" => $contact["ID"],
                            "first" => $contact["FIRST"],
                            "last" => $contact["LAST"],
                            "email" => $contact["EMAIL"],
                            "phone" => $contact["PHONE_NUMBER"]
                        )
                    );
                    echo json_encode($response);
                } else {
                    $response = array("success" => false, "message" => "Contact not found or you don't have permission to view it");
                    echo json_encode($response);
                }
            }

            $stmt->close();
            $conn->close();
        }
    }

    function getAllContacts($userID) {
        global $conn, $servername, $dbUsername, $dbPassword, $dbName;

        // Default credentials
        $conn = new mysqli($servername, $dbUsername, $dbPassword, $dbName);
        if ($conn->connect_error) {
            $response = array("success" => false, "message" => $conn->connect_error);
            echo json_encode($response);
            exit();
        } else {
            $stmt = $conn->prepare("SELECT ID, FIRST, LAST, EMAIL, PHONE_NUMBER FROM CONTACTS WHERE USER_ID = ? ORDER BY LAST, FIRST");
            $stmt->bind_param("i", $userID);

            if (!$stmt->execute()) {
                $response = array("success" => false, "message" => "Failed to retrieve contacts");
                echo json_encode($response);
            } else {
                $result = $stmt->get_result();
                $contacts = array();

                while ($row = $result->fetch_assoc()) {
                    $contacts[] = array(
                        "id" => $row["ID"],
                        "first" => $row["FIRST"],
                        "last" => $row["LAST"],
                        "name" => $row["FIRST"] . " " . $row["LAST"],
                        "email" => $row["EMAIL"],
                        "phone" => $row["PHONE_NUMBER"]
                    );
                }

                $response = array(
                    "success" => true,
                    "contacts" => $contacts
                );
                echo json_encode($response);
            }

            $stmt->close();
            $conn->close();
        }
    }
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

    function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}

    function returnWithInfo( $id, $firstName, $lastName, $email, $phone, $response)
	{
		$retValue = json_encode([
            "response" => 
            [
                "success" => true,
                "id" => $id,
                "first" => $firstName,
                "last" => $lastName,
                "email" => $email,
                "phone" => $phone,
                "error" => ""
            ]
        ]);

        sendResultInfoAsJson( $retValue );

	}
	
?>