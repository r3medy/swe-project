<?php
// Database configuration
$host     = '127.0.0.1';
$db_name  = 'swe_project';
$username = 'root';
$password = '';

// Database options
$opts = [
    // Ensuring data doesn't get corrupted, through silent errors.
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    // Sets default fetch mode to associative array
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    // Disables emulated prepared statements & helps avoid SQL injection attacks
    PDO::ATTR_EMULATE_PREPARES   => false
];
