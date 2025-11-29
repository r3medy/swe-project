<?php

use Slim\App;
use Slim\Routing\RouteCollectorProxy;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// Import Controllers
use src\Controllers\AdminController;
use src\Controllers\AuthController;
use src\Controllers\ChatController;
use src\Controllers\ClientController;
use src\Controllers\FreelancerController;
use src\Controllers\PostController;
use src\Controllers\ProposalController;

return function(App $app) {
    // Cookies
    session_set_cookie_params([
        'lifetime' => 60 * 60 * 24 * 7, // 7 days
        'path' => '/',
        'domain' => 'localhost',
        'secure' => false,
        'httponly' => false, // TRUE IN PRODUCTION
        'samesite' => 'Lax'
    ]);

    if(session_status() === PHP_SESSION_NONE) session_start();

    // Default route
    $app->post('/', function(Request $request, Response $response) {
        $response->getBody()->write(json_encode($request->getParsedBody()));
        return $response;
    });

    // Authentication routes
    $app->group('/auth', function (RouteCollectorProxy $group) {
        $group->post('/checkUser', [AuthController::class, 'checkUser']);
        $group->post('/register', [AuthController::class, 'register']);
        $group->post('/login', [AuthController::class, 'login']);
        $group->post('/logout', [AuthController::class, 'logout']);
        $group->get('/session', [AuthController::class, 'getSession']);
    });

    // Posts routes
    $app->group('/posts', function (RouteCollectorProxy $group) {
        $group->get('/', [PostController::class, 'getAllPosts']);
    });
};
