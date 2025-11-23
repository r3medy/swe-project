<?php
// متلمسش الملف ده
// Don't edit this file
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use DI\Container;
use Slim\Factory\AppFactory;

require __DIR__ . '/vendor/autoload.php';
require './src/core/DatabaseConfig.php'; // Database Configuration

$container  = new Container();
$container->set('db', function () use ($host, $db_name, $username, $password, $opts) {
    // Connection statement
    $conn_stmt = "mysql:host=$host;dbname=$db_name;charset=utf8mb4";
    // Returning the connection
    return new PDO($conn_stmt, $username, $password, $opts);
});

// Creating an application with the database container
AppFactory::setContainer($container);
$app = AppFactory::create();

$app->add(function (Request $request, RequestHandler $handler) {
    $response = $handler->handle($request);

    return $response
        // Force JSON response
        ->withHeader('Content-Type', 'application/json')
        // CORS
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, X-Token-Auth, Authorization');
});

// Middlewares
// Allow JSON inputs
$app->addBodyParsingMiddleware();
// Traffic cop
$app->addRoutingMiddleware();
// Error handler
// displayErrorDetails=true, logErrors=true, logErrorDetails=true
$app->addErrorMiddleware(true, true, true);

// Routes
$routes = require __DIR__ . '/src/core/Routes.php';
$routes($app);

// Pre-flight requests
$app->options('/{routes:.+}', function (Request $request, Response $response, $args) {
    return $response;
});

// Run the server
$app->run();
