<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Models\postModel;
use src\Models\userModel;

class PostController {
    private $db;
    private $postModel;
    private $userModel;

    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->postModel = new postModel($this->db);
        $this->userModel = new userModel($this->db, $_SESSION['userId'] ?? null);
    }

    public function getAllPosts($request, $response) {
        // TODO: Implement getAllPosts
        return $response->withStatus(200);
    }

    public function updatePost($request, $response, $args) {
        $userId = $_SESSION['userId'] ?? null;
        if (!$userId) {
            $response->getBody()->write(json_encode(['status' => 401, 'message' => 'Unauthorized']));
            return $response->withStatus(401);
        }
        $me = $this->userModel->getUserById($userId);
        if (($me['role'] !== 'Client' || $userId !== $me['userId']) && $me['role'] !== 'Admin') {
            $response->getBody()->write(json_encode(['status' => 401, 'message' => 'Unauthorized']));
            return $response->withStatus(401);
        }

        $postId = $args['postId'];
        $data = $request->getParsedBody();

        $allowedFields = ['jobTitle', 'jobDescription', 'budget', 'hourlyRate', 'jobType'];
        $updates = [];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowedFields)) {
                $updates[$key] = $value;
            }
        }

        if (empty($updates)) {
            $response->getBody()->write(json_encode(['status' => 400, 'message' => 'No fields to update']));
            return $response->withStatus(400);
        }

        $this->postModel->editPost($postId, $updates);

        $response->getBody()->write(json_encode(['status' => 200, 'message' => 'Post updated successfully']));
        return $response->withStatus(200);
    }
}
