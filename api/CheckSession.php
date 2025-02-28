<?php
session_start();

// Check if user session exists
if (isset($_SESSION["USER"]) && isset($_SESSION["PASSWORD"]) && isset($_SESSION["USER_ID"])) {
    // Load the .env file
    $env = parse_ini_file('./../.env');
    if ($env === false) {
        returnWithError("Failed to load .env file");
        exit();
    }

    $servername = $env["SERVER_NAME"] ?? null;
    $dbUsername = $env["DB_USERNAME"] ?? null;
    $dbPassword = $env["DB_PASSWORD"] ?? null;
    $dbName = $env["DB_NAME"] ?? null;

    // Connect to database
    $conn = mysqli_init();
    if (!$conn) {
        returnWithError("mysqli_init failed");
        exit();
    }

    if (!$conn->real_connect($servername, $dbUsername, $dbPassword, $dbName)) {
        returnWithError("Connection failed: " . $conn->connect_error);
        exit();
    }

    // Verify credentials are still valid
    $stmt = $conn->prepare("SELECT ID FROM USERS WHERE ID=? AND USER=? AND PASSWORD=?");
    $stmt->bind_param("iss", $_SESSION["USER_ID"], $_SESSION["USER"], $_SESSION["PASSWORD"]);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->fetch_assoc()) {
        // Valid session
        $response = [
            "success" => true,
            "error" => ""
        ];
    } else {
        // Invalid credentials
        session_unset();
        session_destroy();
        $response = [
            "success" => false,
            "error" => "Invalid session"
        ];
    }

    $stmt->close();
    $conn->close();
} else {
    // No session
    $response = [
        "success" => false,
        "error" => "No session"
    ];
}

header('Content-Type: application/json');
echo json_encode($response);

function returnWithError($err) {
    $response = [
        "success" => false,
        "error" => $err
    ];
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}
?> 