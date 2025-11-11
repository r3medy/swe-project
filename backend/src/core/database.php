<?php
namespace Core;
use PDO;
use PDOException;

class Database {
    // Database configuration
    private static $host = '127.0.0.1';        // Database host
    private static $db_name = 'swe_project';   // Database name
    private static $username = 'root';         // Database username
    private static $password = '';             // Database password
    // Database connection
    private static ?PDO $conn = null;
    // Get the database connection
    public static function getConnection(): PDO {
        if(self::$conn === null) {
            $c = "mysql:host=" . self::$host . ";dbname=" . self::$db_name . ";charset=utf8mb4";
            $opts = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            try {
                self::$conn = new PDO($c, self::$username, self::$password, $opts);
                return self::$conn;
            } catch (PDOException $e) {
                throw new PDOException($e->getMessage(), (int)$e->getCode());
            }
        }
        return self::$conn;
    }
}
