<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Models\userModel;

// ? Completed
class ProfileController {
    private $db;
    private $userModel;

    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->userModel = new userModel($this->db, $_SESSION['userId'] ?? null);
    }

    public function getProfile($request, $response, $args) {
        $identifier = $args['identifier'] ?? null;

        // Determine user
        if (!$identifier && !isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
        $user = $this->userModel->getUser($identifier ?? $_SESSION['userId']);

        if (!$user) return $this->error($response, 'User not found', 404);

        // Get user tags
        $user['tags'] = $this->userModel->getUserTags($user['userId']);

        $response->getBody()->write(json_encode(['user' => $user]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
    
    public function getSavedPosts($request, $response) {
        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
        $posts = $this->userModel->getSavedPosts($_SESSION['userId']);

        $response->getBody()->write(json_encode(['savedPosts' => $posts]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function getClientPosts($request, $response, $args) {
        $identifier = $args['identifier'] ?? null;
        $user = null;

        // Determine user
        if (!$identifier && !isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
        $user = $this->userModel->getUser($identifier ?? $_SESSION['userId']);

        if (!$user) return $this->error($response, 'User not found', 404);
        if ($user['role'] !== 'Client') return $this->error($response, 'Forbidden: Not a client', 403);

        $posts = $this->userModel->getClientPosts($user['userId']);

        $response->getBody()->write(json_encode(['clientPosts' => $posts]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function updateProfile($request, $response) {
        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
        
        $actions = $request->getParsedBody();
        $this->userModel->updateUser($actions);

        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    private function error($response, $message, $status) {
        $response->getBody()->write(json_encode(['error' => $message]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}
