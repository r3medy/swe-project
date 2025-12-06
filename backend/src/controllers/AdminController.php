<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Models\userModel;
use src\Models\postModel;

class AdminController {
    private $db;
    private $userModel;
    private $postModel;

    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->userModel = new userModel($this->db, $_SESSION['userId'] ?? null);
        $this->postModel = new postModel($this->db);
    }

    // updatePostStatus($postId, $status), editPost($postId, $changes), deletePost($postId), getPendingPosts()
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
        $posts = $this->userModel->getPendingPosts();
        
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
        
        $allowedFields = ['firstName', 'lastName', 'username', 'email', 'title', 'country', 'role', 'gender', 'bio'];
        $updates = [];
        $params = [':userId' => $userId];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }
        
        if (empty($updates)) {
            $response->getBody()->write(json_encode(["status" => 400, "message" => "No fields to update"]));
            return $response->withStatus(400);
        }
        
        $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE userId = :userId";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        $response->getBody()->write(json_encode(["status" => 200, "message" => "User updated successfully"]));
        return $response->withStatus(200);
    }

    private function requireAdmin($me, $response) {
        if($me['role'] !== 'Admin') {
            $response->getBody()->write(json_encode(["status" => 401, "message" => "Unauthorized"]));
            return $response->withStatus(401);
        }
    }
}
