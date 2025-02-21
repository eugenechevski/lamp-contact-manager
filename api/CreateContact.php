<?php
//Input data
$inData = getRequestInfo();

//Variable data from input
//Assumed Names
$userID = $inData["USER_ID"];
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
$conn = new mysqli("localhost", "root", "", "contact_manager");
if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    //Add the contact
    $stmt = $conn->prepare("INSERT into CONTACTS (FIRST, LAST, EMAIL, PHONE_NUMBER, USER_ID) VALUES(?,?,?,?,?)");
    $stmt->bind_param("ssssi", $firstName, $lastName, $email, $phone, $userID);

    $stmt->execute();

    $stmt->close();
    $conn->close();
    returnWithError("");
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