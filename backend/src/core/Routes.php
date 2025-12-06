<?php

// Import Controllers
use src\Controllers\AdminController;
use src\Controllers\AuthController;
use src\Controllers\ChatController;
use src\Controllers\ProfileController;
use src\Controllers\TagController;
use src\Controllers\PostController;
use src\Controllers\ProposalController;
use src\Controllers\NotificationsController;

return function ($app) {
    // Default route
    $app->post('/', function ($request, $response) {
        $response->getBody()->write(json_encode(["message" => "Hello World"]));
        return $response->withStatus(200);
    });

    // Authentication routes
    $app->group('/auth', function ($group) {
        $group->post('/checkUser', [AuthController::class, 'checkUser']);
        $group->post('/register', [AuthController::class, 'register']);
        $group->post('/login', [AuthController::class, 'login']);
        $group->post('/logout', [AuthController::class, 'logout']);
        $group->post('/changePassword', [AuthController::class, 'changePassword']);
        $group->get('/session', [AuthController::class, 'getSession']);
        $group->delete('/deleteAccount', [AuthController::class, 'deleteAccount']);
    });

    // Profile routes
    $app->group('/profile', function ($group) {
        $group->get('/saved', [ProfileController::class, 'getSavedPosts']);
        $group->get('/clientPosts/[{identifier}]', [ProfileController::class, 'getClientPosts']);
        $group->get('/savedPosts', [ProfileController::class, 'getSavedPosts']);
        $group->get('/[{identifier}]', [ProfileController::class, 'getProfile']);
        $group->post('', [ProfileController::class, 'updateProfile']);
        $group->post('/uploadPicture', [ProfileController::class, 'updateProfilePicture']);
    });

    // Tags routes
    $app->group('/tags', function ($group) {
        $group->get('', [TagController::class, 'getTags']);
    });

    // Posts routes
    $app->group('/posts', function ($group) {
        $group->get('', [PostController::class, 'getAllPosts']);
    });

    // Notifications routes
    $app->group('/notifications', function($group) {
        $group->get('', [NotificationsController::class, 'getAllNotifications']);
        $group->delete('/{notificationId}', [NotificationsController::class, 'deleteNotification']);
        $group->post('/markallread', [NotificationsController::class, 'markAllRead']);
        $group->post('/markread/{notificationId}', [NotificationsController::class, 'markRead']);
    });

    // Proposals routes
    $app->group('/proposals', function($group) {
        $group->get('/{postId}', [ProposalController::class,'getProposals']);
        $group->post('/{postId}', [ProposalController::class,'createProposal']);
        $group->put('/decline/{postId}/{proposalId}', [ProposalController::class,'declineProposal']);
        $group->put('/accept/{postId}/{proposalId}', [ProposalController::class,'acceptProposal']);
        $group->get('/proposal/{proposalId}', [ProposalController::class,'getProposalById']);
        $group->put('/update/{proposalId}', [ProposalController::class,'updateProposal']);
        $group->delete('/{postId}/{proposalId}', [ProposalController::class,'deleteProposal']);
    });

    // Admin routes
    $app->group('/admin', function ($group) {
        $group->get('/users', [AdminController::class, 'getAllUsers']);
        $group->put('/users/{userId}', [AdminController::class, 'updateUser']);
        $group->delete('/users/{userId}', [AdminController::class, 'deleteUser']);
    });
};
