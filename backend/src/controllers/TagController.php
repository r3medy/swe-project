<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Core\ApiResponse;
use src\Models\tagModel;
use src\Models\userModel;

class TagController {
    use ApiResponse;

    private $db;
    private $tagModel;
    private $userModel;

    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->tagModel = new tagModel($this->db);
        $this->userModel = new userModel($this->db, $_SESSION['userId'] ?? null);
    }

    public function getAllTags($request, $response) {
        $query = $request->getQueryParams();
        $tags = $this->tagModel->getAllTags($query['page'] ?? 1, $query['limit'] ?? 50);

        $response->getBody()->write(json_encode($tags));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function createTag($request, $response) {
        if ($error = $this->requireAdmin($response)) return $error;

        $data = $request->getParsedBody() ?? [];
        if (empty($data['tagName'])) return $this->error($response, 'Tag name is required', 400);

        $this->tagModel->addTag($data['tagName']);

        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function updateTag($request, $response, $args) {
        if ($error = $this->requireAdmin($response)) return $error;

        $data = $request->getParsedBody() ?? [];
        if (empty($data['tagName'])) return $this->error($response, 'Tag name is required', 400);

        $this->tagModel->editTag($args['tagId'], $data['tagName']);

        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function deleteTag($request, $response, $args) {
        if ($error = $this->requireAdmin($response)) return $error;

        $this->tagModel->removeTagById($args['tagId']);

        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    private function requireAdmin($response) {
        $userId = $_SESSION['userId'] ?? null;
        if (!$userId) return $this->error($response, 'Unauthorized', 401);

        $me = $this->userModel->getUserById($userId);
        if (!$me || $me['role'] !== 'Admin') return $this->error($response, 'Forbidden', 403);

        return null;
    }
}
