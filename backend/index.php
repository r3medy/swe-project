<?php
// متلمسش الملف ده
// Don't edit this file
// HTTP Router
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/vendor/autoload.php';

use src\controllers\ExampleController;

$app = AppFactory::create();

$routesTable = [
    // Path => [Controller Class, [Allowed Methods]]
    '/example' => [ExampleController::class, ['GET']]
];

// Loop over routes table
foreach ($routesTable as $path => [$controllerClass, $methods]) {
    foreach ($methods as $method) {
        if (method_exists($controllerClass, $method)) {
            $callable = $controllerClass . '::' . $method;

            switch (strtoupper($method)) {
                case 'GET':
                    $app->get($path, $callable);
                    break;
                case 'POST':
                    $app->post($path, $callable);
                    break;
                case 'DELETE':
                    $app->delete($path, $callable);
                    break;
            }
        }
    }
}

// Middlewares
$app->addRoutingMiddleware();
$app->addErrorMiddleware(true, true, true);

// Run the server
$app->run();
