<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Core\ApiResponse;
use src\Core\AuditLogger;
use src\Models\userModel;

class AuthController {
    use ApiResponse;

    private $db;
    private $userModel;

    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->userModel = new userModel($this->db, $_SESSION['userId'] ?? null);
    }

    public function register($request, $response) {
        $requestBody = $request->getParsedBody() ?? [];
        
        // Check if user already exists
        $existingUser = $this->userModel->getUser($requestBody['email'] ?? $requestBody['username'] ?? '', true);
        
        if ($existingUser) {
            AuditLogger::log('auth.register.duplicate', ['identifier' => $requestBody['email'] ?? $requestBody['username'] ?? null]);
            return $this->error($response, 'User already exists', 409);
        }

        // Save in database
        $result = $this->userModel->storeUser($requestBody);

        if ($result['status'] === 400) {
            AuditLogger::log('auth.register.failed', ['identifier' => $requestBody['email'] ?? $requestBody['username'] ?? null]);
            $response->getBody()->write(json_encode([
                'error' => ['code' => 400, 'message' => $result['message']],
                'data' => $result['errors'] ?? null,
            ]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $response->getBody()->write(json_encode(["message" => "User registered successfully"]));
        AuditLogger::log('auth.register.success', ['identifier' => $requestBody['email'] ?? $requestBody['username'] ?? null]);
        return $response->withStatus(201);
    }

    public function login($request, $response) {
        $requestBody = $request->getParsedBody() ?? [];

        if (!isset($requestBody['usernameoremail']) || !isset($requestBody['password'])) {
            return $this->error($response, 'Invalid username or email and password', 400);
        }

        $usernameoremail = $requestBody['usernameoremail'];
        $password = $requestBody['password'];

        // Get user from database 
        $user = $this->userModel->getUser($usernameoremail, false);

        if (!$user) {
            AuditLogger::log('auth.login.failed', ['identifier' => $usernameoremail, 'reason' => 'not_found']);
            return $this->error($response, 'User not found', 404);
        }

        if (!password_verify($password, $user['hashedPassword'])) {
            AuditLogger::log('auth.login.failed', ['identifier' => $usernameoremail, 'reason' => 'invalid_password']);
            return $this->error($response, 'Invalid username or email and password', 401);
        }

        session_regenerate_id(true);
        $_SESSION['userId'] = $user['userId'];
        $_SESSION['role'] = $user['role'];
        AuditLogger::log('auth.login.success', ['targetUserId' => $user['userId']]);

        $response->getBody()->write(json_encode([
            "message" => "Login successful",
            "csrfToken" => $_SESSION['csrfToken'] ?? null,
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
            return $this->error($response, 'Unauthorized', 401);
        }

        $data = $request->getParsedBody() ?? [];
        $oldPassword = $data['currentPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        if (empty($oldPassword) || empty($newPassword)) {
            return $this->error($response, 'Both fields are required', 400);
        }
        if (!$this->isStrongPassword($newPassword)) {
            return $this->error($response, 'Password must be at least 8 characters long and include mixed case plus a digit or special character', 400);
        }

        $result = $this->userModel->changePassword($oldPassword, $newPassword);

        return $this->result($response, $result);
    }

    public function logout($request, $response) {
        AuditLogger::log('auth.logout');
        $this->deleteSession();

        $response->getBody()->write(json_encode(["message" => "Logout successful"]));
        return $response->withStatus(200);
    }

    public function getSession($request, $response) {
        if (!isset($_SESSION['userId'])) {
            return $this->error($response, 'No active session', 401);
        }

        $user = $this->userModel->getUserById($_SESSION['userId'], true);

        if (!$user) {
            $this->deleteSession();
            return $this->error($response, 'No active session', 401);
        }

        $response->getBody()->write(json_encode([
            "message" => "Session active",
            "csrfToken" => $_SESSION['csrfToken'] ?? null,
            "data" => $user
        ]));
        return $response->withStatus(200);
    }

    public function deleteAccount($request, $response) {
        $userId = $_SESSION['userId'] ?? null;
        if (!$userId) {
            return $this->error($response, 'Unauthorized', 401);
        }

        $result = $this->userModel->deleteUser($userId);
        if ($result['status'] === 200) $this->deleteSession();

        return $this->result($response, $result);
    }

    public function checkUser($request, $response) {
        $requestBody = $request->getParsedBody() ?? [];
        $loginValue = $requestBody['usernameoremail'] ?? $requestBody['username'] ?? $requestBody['email'] ?? null;

        if (!$loginValue) {
            return $this->error($response, 'No credentials provided', 400);
        }

        $user = $this->userModel->getUser($loginValue, true);

        if (!$user) {
            return $this->error($response, 'User not found', 404);
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

    private function isStrongPassword($password) {
        return is_string($password)
            && strlen($password) >= 8
            && preg_match('/[a-z]/', $password)
            && preg_match('/[A-Z]/', $password)
            && preg_match('/[\d\W_]/', $password);
    }
}

