<?php

use Slim\App;
use Slim\Routing\RouteCollectorProxy;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// Import Controllers
use src\Controllers\AdminController;
use src\Controllers\AuthController;
use src\Controllers\ChatController;
use src\Controllers\ProfileController;
use src\Controllers\TagController;
use src\Controllers\PostController;
use src\Controllers\ProposalController;

return function (App $app) {
    // Cookies
    session_set_cookie_params([
        'lifetime' => 60 * 60 * 24 * 7, // 7 days
        'path' => '/',
        'secure' => false,
        'httponly' => false // True only in production
    ]);

    if (session_status() === PHP_SESSION_NONE)
        session_start();

    // Default route
    $app->post('/', function (Request $request, Response $response) {
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

    // Profile routes
    $app->group('/profile', function (RouteCollectorProxy $group) {
        $group->get('/saved', [ProfileController::class, 'getSavedPosts']);
        $group->get('/clientPosts', [ProfileController::class, 'getClientPosts']);
        $group->get('/[{identifier}]', [ProfileController::class, 'getProfile']);
        $group->post('', [ProfileController::class, 'updateProfile']);
    });

    // Tags routes
    $app->group('/tags', function (RouteCollectorProxy $group) {
        $group->get('', [TagController::class, 'getTags']);
    });

    // Posts routes
    $app->group('/posts', function (RouteCollectorProxy $group) {
        $group->get('/', [PostController::class, 'getAllPosts']);
    });
};
