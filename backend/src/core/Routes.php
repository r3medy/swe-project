<?php

// Import Controllers
use src\Controllers\AdminController;
use src\Controllers\AuthController;
use src\Controllers\ChatController;
use src\Controllers\ProfileController;
use src\Controllers\TagController;
use src\Controllers\PostController;
use src\Controllers\ProposalController;

return function ($app) {
    // Cookies
    session_set_cookie_params([
        'lifetime' => 60 * 60 * 24 * 7, // 7 days
        'path' => '/',
        'secure' => false,
        'httponly' => true
    ]);

    if (session_status() === PHP_SESSION_NONE)
        session_start();

    // Default route
    $app->post('/', function ($request, $response) {
        $response->getBody()->write(json_encode($request->getParsedBody()));
        return $response;
    });

    // Authentication routes
    $app->group('/auth', function ($group) {
        $group->post('/checkUser', [AuthController::class, 'checkUser']);
        $group->post('/register', [AuthController::class, 'register']);
        $group->post('/login', [AuthController::class, 'login']);
        $group->post('/logout', [AuthController::class, 'logout']);
        $group->post('/changePassword', [AuthController::class, 'changePassword']);
        $group->get('/session', [AuthController::class, 'getSession']);
    });

    // Profile routes
    $app->group('/profile', function ($group) {
        $group->get('/saved', [ProfileController::class, 'getSavedPosts']);
        $group->get('/clientPosts/[{identifier}]', [ProfileController::class, 'getClientPosts']);
        $group->get('/savedPosts', [ProfileController::class, 'getSavedPosts']);
        $group->get('/[{identifier}]', [ProfileController::class, 'getProfile']);
        $group->post('', [ProfileController::class, 'updateProfile']);
    });

    // Tags routes
    $app->group('/tags', function ($group) {
        $group->get('', [TagController::class, 'getTags']);
    });

    // Posts routes
    $app->group('/posts', function ($group) {
        $group->get('/', [PostController::class, 'getAllPosts']);
    });
};
