<?php
// Database configuration
if (!function_exists('database_config_env')) {
    function database_config_env($key, $default) {
        $value = getenv($key);
        return $value === false ? $default : $value;
    }
}

$host = database_config_env('DB_HOST', 'localhost:3308');
$db_name = database_config_env('DB_NAME', 'swe_project');
$username = database_config_env('DB_USER', 'root');
$password = database_config_env('DB_PASSWORD', 'yousef20055_');

// Database options
$opts = [
    // Ensuring data doesn't get corrupted, through silent errors.
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    // Sets default fetch mode to associative array
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    // Disables emulated prepared statements & helps avoid SQL injection attacks
    PDO::ATTR_EMULATE_PREPARES   => false
];
