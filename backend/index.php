<?php
// متلمسش الملف ده
// Don't edit this file
use DI\Container;
use Slim\Factory\AppFactory;

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/src/core/DatabaseConfig.php'; // Database Configuration

// Cookies & Session
session_set_cookie_params([
    'lifetime' => 86400 * 7, // 7 days
    'path' => '/',
    'domain' => '',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

if (session_status() === PHP_SESSION_NONE) session_start();

$container = new Container();
$container->set('db', function () use ($host, $db_name, $username, $password, $opts) {
    // Connection statement
    $conn_stmt = "mysql:host=$host;dbname=$db_name;charset=utf8mb4";
    // Returning the connection
    return new PDO($conn_stmt, $username, $password, $opts);
});

// Creating an application with the database container
AppFactory::setContainer($container);
$app = AppFactory::create();

// Middlewares
// Allow JSON inputs
$app->addBodyParsingMiddleware();
// Error handler
// displayErrorDetails=true, logErrors=true, logErrorDetails=true
$app->addErrorMiddleware(true, true, true);

$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    $origin = $request->getHeaderLine('Origin');
    $allowedOrigin = $origin ? $origin : '*';

    return $response
        // Force JSON response
        ->withHeader('Content-Type', 'application/json')
        // CORS
        ->withHeader('Access-Control-Allow-Credentials', 'true')
        ->withHeader('Access-Control-Allow-Origin', $allowedOrigin)
        ->withHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, X-Token-Auth, Authorization');
});

// Routes
$routes = require __DIR__ . '/src/core/Routes.php';
$routes($app);

// Pre-flight requests
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response->withStatus(200);
});

// Run the server
$app->run();
