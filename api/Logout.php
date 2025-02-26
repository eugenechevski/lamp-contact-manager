<?php

// session_id('myTestSessionId'); // For CLI testing 
session_start();
session_unset();
session_destroy();

// Return success response
$response = [
    "success" => true,
    "error" => ""
];

header('Content-Type: application/json');
echo json_encode($response);

?>