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
    // Default route
    $app->get('/', function(Request $request, Response $response) {
        $response->getBody()->write(json_encode(['message' => 'Freelancing platform server is running']));
        return $response;
    });

    // Authentication routes
    $app->group('/auth', function (RouteCollectorProxy $group) {
        $group->post('/register', [AuthController::class, 'register']);
    });

    // Posts routes
    $app->group('/posts', function (RouteCollectorProxy $group) {
        $group->get('/', [PostController::class, 'getAllPosts']);
    });
};
