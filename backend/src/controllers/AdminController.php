<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Core\ApiResponse;
use src\Core\AuditLogger;
use src\Models\userModel;
use src\Models\postModel;

class AdminController {
    use ApiResponse;

    private $db;
    private $userModel;
    private $postModel;

    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->userModel = new userModel($this->db, $_SESSION['userId'] ?? null);
        $this->postModel = new postModel($this->db);
    }

    public function getAllUsers($request, $response) {
        if ($error = $this->requireAdmin($response)) return $error;

        $query = $request->getQueryParams();
        $users = $this->userModel->getAllUsers($query['page'] ?? 1, $query['limit'] ?? 50);
        
        $response->getBody()->write(json_encode($users));
        return $response->withStatus(200);
    }

    public function getPendingPosts($request, $response) {
        if ($error = $this->requireAdmin($response)) return $error;

        $query = $request->getQueryParams();
        $posts = $this->postModel->getPendingPosts($query['page'] ?? 1, $query['limit'] ?? 50);
        
        $response->getBody()->write(json_encode($posts));
        return $response->withStatus(200);
    }

    public function updatePostStatus($request, $response, $args) {
        if ($error = $this->requireAdmin($response)) return $error;

        $body = $request->getParsedBody() ?? [];
        $status = $body['status'] ?? 'Accepted';
        if (!in_array($status, ['Pending', 'Accepted', 'Refused'], true)) {
            return $this->error($response, 'Invalid post status', 400);
        }

        $result = $this->postModel->updatePostStatus($args['postId'], $status);
        AuditLogger::log('admin.post.update_status', ['postId' => $args['postId'], 'status' => $status]);

        return $this->result($response, $result);
    }

    public function createNewUser($request, $response) {
        if ($error = $this->requireAdmin($response)) return $error;

        $data = $request->getParsedBody() ?? [];
        $result = $this->userModel->storeUser($data, true);
        if ($result['status'] === 201) {
            $result = ["status" => 200, "message" => "User created"];
        }
        AuditLogger::log('admin.user.create', ['username' => $data['username'] ?? null, 'status' => $result['status']]);
        
        return $this->result($response, $result);
    }

    public function deleteUser($request, $response, $args) {
        if ($error = $this->requireAdmin($response)) return $error;

        $userId = $args['userId'];
        $result = $this->userModel->deleteUser($userId);
        AuditLogger::log('admin.user.delete', ['targetUserId' => $userId, 'status' => $result['status']]);
        
        return $this->result($response, $result);
    }

    public function updateUser($request, $response, $args) {
        if ($error = $this->requireAdmin($response)) return $error;

        $userId = $args['userId'];
        $data = $request->getParsedBody() ?? [];
        
        $result = $this->userModel->updateUserByAdmin($userId, $data);
        AuditLogger::log('admin.user.update', ['targetUserId' => $userId, 'fields' => array_keys($data), 'status' => $result['status']]);
        
        return $this->result($response, $result);
    }

    private function requireAdmin($response) {
        $userId = $_SESSION['userId'] ?? null;
        if (!$userId) return $this->error($response, 'Unauthorized', 401);

        $me = $this->userModel->getUserById($userId);
        if (!$me || $me['role'] !== 'Admin') return $this->error($response, 'Forbidden', 403);

        return null;
    }
}
