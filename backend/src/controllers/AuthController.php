<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Models\userModel;

class AuthController {
    private $db;
    private $userModel;

    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->userModel = new userModel($this->db, $_SESSION['userId'] ?? null);
    }

    public function register($request, $response) {
        $requestBody = $request->getParsedBody();
        
        // Check if user already exists
        $existingUser = $this->userModel->getUser($requestBody['email'] ?? $requestBody['username'] ?? '', true);
        
        if ($existingUser) {
            $response->getBody()->write(json_encode(["message" => "User already exists"]));
            return $response->withStatus(409);
        }

        // Save in database
        $result = $this->userModel->storeUser($requestBody);

        if ($result['status'] === 400) {
            $response->getBody()->write(json_encode([
                "message" => $result['message'],
                "data" => $result['errors'] ?? null
            ]));
            return $response->withStatus(400);
        }

        $response->getBody()->write(json_encode(["message" => "User registered successfully"]));
        return $response->withStatus(201);
    }

    public function login($request, $response) {
        $requestBody = $request->getParsedBody();

        if (!isset($requestBody['usernameoremail']) || !isset($requestBody['password'])) {
            $response->getBody()->write(json_encode(["message" => "Invalid username or email and password"]));
            return $response->withStatus(400);
        }

        $usernameoremail = $requestBody['usernameoremail'];
        $password = $requestBody['password'];

        // Get user from database 
        $user = $this->userModel->getUser($usernameoremail, false);

        if (!$user) {
            $response->getBody()->write(json_encode(["message" => "User not found"]));
            return $response->withStatus(404);
        }

        if (!password_verify($password, $user['hashedPassword'])) {
            $response->getBody()->write(json_encode(["message" => "Invalid username or email and password"]));
            return $response->withStatus(401);
        }

        session_regenerate_id(true);
        $_SESSION['userId'] = $user['userId'];

        $response->getBody()->write(json_encode([
            "message" => "Login successful",
            "user" => [
                "userId" => $user['userId'],
                "username" => $user['username'],
                "role" => $user['role']
            ]
        ]));

        return $response->withStatus(200);
    }

    public function changePassword($request, $response) {
        $userId = $_SESSION['userId'] ?? null;
        if (!$userId) {
            $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }

        $data = $request->getParsedBody();
        $oldPassword = $data['currentPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        if (empty($oldPassword) || empty($newPassword)) {
            $response->getBody()->write(json_encode(['error' => 'Both fields are required']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $result = $this->userModel->changePassword($oldPassword, $newPassword);

        $response->getBody()->write(json_encode([
            'status' => $result['status'],
            'message' => $result['message']
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($result['status']);
    }

    public function logout($request, $response) {
        $this->deleteSession();

        $response->getBody()->write(json_encode(["message" => "Logout successful"]));
        return $response->withStatus(200);
    }

    public function getSession($request, $response) {
        if (!isset($_SESSION['userId'])) {
            $response->getBody()->write(json_encode(["message" => "No active session"]));
            return $response->withStatus(401);
        }

        $user = $this->userModel->getUserById($_SESSION['userId'], true);

        if (!$user) {
            $response->getBody()->write(json_encode(["message" => "No active session"]));
            return $response->withStatus(401);
        }

        $response->getBody()->write(json_encode([
            "message" => "Session active",
            "data" => $user
        ]));
        return $response->withStatus(200);
    }

    public function deleteAccount($request, $response) {
        $userId = $_SESSION['userId'] ?? null;
        if (!$userId) {
            $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }

        $result = $this->userModel->deleteUser($userId);
        if ($result['status'] === 200) $this->deleteSession();

        $response->getBody()->write(json_encode([
            'status' => $result['status'],
            'message' => $result['message']
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($result['status']);
    }

    public function checkUser($request, $response) {
        $requestBody = $request->getParsedBody();
        $loginValue = $requestBody['usernameoremail'] ?? $requestBody['username'] ?? $requestBody['email'] ?? null;

        if (!$loginValue) {
            $response->getBody()->write(json_encode(["message" => "No credentials provided", "data" => null]));
            return $response->withStatus(400);
        }

        $user = $this->userModel->getUser($loginValue, true);

        if (!$user) {
            $response->getBody()->write(json_encode(["message" => "User not found", "data" => null]));
            return $response->withStatus(404);
        }

        $response->getBody()->write(json_encode([
            "message" => "User exists",
            "data" => [
                "userId" => $user['userId'],
                "username" => $user['username'],
                "email" => $user['email'],
                "role" => $user['role']
            ]
        ]));
        return $response->withStatus(200);
    }

    private function deleteSession() {
        $_SESSION = [];
        session_unset();
        session_destroy();

        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }
    }
}

