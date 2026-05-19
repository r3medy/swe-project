<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Models\userModel;
use src\Models\postModel;
use src\Models\notificationModel;

class AdminController {
    private $db;
    private $userModel;
    private $postModel;
    private $notificationModel;

    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->userModel = new userModel($this->db, $_SESSION['userId'] ?? null);
        $this->postModel = new postModel($this->db);
        $this->notificationModel = new notificationModel($this->db); 
    }

    public function getAllUsers($request, $response) {
        $me = $this->userModel->getUserById($_SESSION['userId']);
        
        $this->requireAdmin($me, $response);
        $users = $this->userModel->getAllUsers();
        
        $response->getBody()->write(json_encode($users));
        return $response->withStatus(200);
    }

    public function getPendingPosts($request, $response) {
        $me = $this->userModel->getUserById($_SESSION['userId']);
        
        $this->requireAdmin($me, $response);
        $posts = $this->postModel->getPendingPosts();
        
        $response->getBody()->write(json_encode($posts));
        return $response->withStatus(200);
    }

    public function updatePostStatus($request, $response, $args) {
        $me = $this->userModel->getUserById($_SESSION['userId']);
        $this->requireAdmin($me, $response);

        $status = $request->getParsedBody()['status'] ?? "Accepted";
        $postId = $args['postId'];


        $this->postModel->updatePostStatus($postId, $status);

        $response->getBody()->write(json_encode(["status" => 200, "message" => "Post status updated"]));
        return $response->withStatus(200);
    }

    public function createNewUser($request, $response) {
        $me = $this->userModel->getUserById($_SESSION['userId']);
        $this->requireAdmin($me, $response);

        $data = $request->getParsedBody();
        $this->userModel->storeUser($data);
        
        $response->getBody()->write(json_encode(["status" => 200, "message" => "User created"]));
        return $response->withStatus(200);
    }

    public function deleteUser($request, $response, $args) {
        $me = $this->userModel->getUserById($_SESSION["userId"]);
        $this->requireAdmin($me, $response);

        $userId = $args['userId'];
        $this->userModel->deleteUser($userId);
        
        $response->getBody()->write(json_encode(["status" => 200, "message" => "User deleted"]));
        return $response->withStatus(200);
    }

    public function updateUser($request, $response, $args) {
        $me = $this->userModel->getUserById($_SESSION["userId"]);
        $this->requireAdmin($me, $response);

        $userId = $args['userId'];
        $data = $request->getParsedBody();
        
        $result = $this->userModel->updateUserByAdmin($userId, $data);
        
        $response->getBody()->write(json_encode($result));
        return $response->withStatus($result['status']);
    }

    private function requireAdmin($me, $response) {
        if($me['role'] !== 'Admin') {
            $response->getBody()->write(json_encode(["status" => 401, "message" => "Unauthorized"]));
            return $response->withStatus(401);
        }
    }
}
