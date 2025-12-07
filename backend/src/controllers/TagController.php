<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Models\tagModel;
use src\Models\userModel;

// ? Completed
class TagController {
    private $db;
    private $tagModel;
    private $userModel;

    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->tagModel = new tagModel($this->db);
        $this->userModel = new userModel($this->db, $_SESSION['userId'] ?? null);
    }

    public function getAllTags($request, $response) {
        $tags = $this->tagModel->getAllTags();

        $response->getBody()->write(json_encode($tags));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function createTag($request, $response) {
        if (!isset($_SESSION['userId'])) {
            $response->getBody()->write(json_encode(["status" => 401, "message" => "Unauthorized"]));
            return $response->withStatus(401);
        }
        $me = $this->userModel->getUserById($_SESSION['userId']);
        $this->requireAdmin($me, $response);

        $data = $request->getParsedBody();
        $this->tagModel->addTag($data['tagName']);

        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function updateTag($request, $response, $args) {
        if (!isset($_SESSION['userId'])) {
            $response->getBody()->write(json_encode(["status" => 401, "message" => "Unauthorized"]));
            return $response->withStatus(401);
        }
        $me = $this->userModel->getUserById($_SESSION['userId']);
        $this->requireAdmin($me, $response);

        $data = $request->getParsedBody();
        $this->tagModel->editTag($args['tagId'], $data['tagName']);

        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function deleteTag($request, $response, $args) {
        if (!isset($_SESSION['userId'])) {
            $response->getBody()->write(json_encode(["status" => 401, "message" => "Unauthorized"]));
            return $response->withStatus(401);
        }
        $me = $this->userModel->getUserById($_SESSION['userId']);
        $this->requireAdmin($me, $response);

        $this->tagModel->removeTagById($args['tagId']);

        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    private function requireAdmin($me, $response) {
        if($me['role'] !== 'Admin') {
            $response->getBody()->write(json_encode(["status" => 401, "message" => "Unauthorized"]));
            return $response->withStatus(401);
        }
    }
}
