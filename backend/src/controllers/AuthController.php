<?php

namespace src\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;
use PDO;

use src\Core\Validator;

class AuthController {
    private $db;
    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
    }
    
    public function register(Request $request, Response $response) {
        $doesUserExist = $this->checkCredentials($request);

        if(isset($doesUserExist['status']) && $doesUserExist['status'] == 200) {
            $response->getBody()->write(json_encode(["message" => "User already exists"]));
            return $response->withStatus(409);
        }
        
        $requestBody = $request->getParsedBody();

        // Validate the request body
        $requiredFields = ['username', 'email', 'password', 'role', 'firstName', 'lastName', 'title', 'country', 'bio'];
        $validator = new Validator();
        foreach($requiredFields as $field) {
            $validator->validate($field, $requestBody[$field] ?? null);
        }

        if(count($validator->errors) > 0) {
            $response->getBody()->write(json_encode(["message" => "Validation failed", "data" => $validator->errors]));
            return $response->withStatus(400);
        }

        $stmt = $this->db->prepare("INSERT INTO users (username, email, hashedPassword, role, firstName, lastName, title, country, bio, SSN) VALUES (:username, :email, :hashedPassword, :role, :firstName, :lastName, :title, :country, :bio, NULL)");
        $stmt->execute([
            'username' => $requestBody['username'],
            'email' => $requestBody['email'],
            'hashedPassword' => password_hash($requestBody['password'], PASSWORD_DEFAULT),
            'role' => $requestBody['role'],
            'firstName' => $requestBody['firstName'],
            'lastName' => $requestBody['lastName'],
            'title' => $requestBody['title'],
            'country' => $requestBody['country'],
            'bio' => $requestBody['bio']
        ]);

        $response->getBody()->write(json_encode(["message" => "User registered successfully"]));
        return $response->withStatus(201);
    }

    public function login(Request $request, Response $response) {
        $doesUserExist = $this->checkCredentials($request);
        if(isset($doesUserExist['status']) && $doesUserExist['status'] == 404) {
            $response->getBody()->write(json_encode(["message" => "User not found"]));
            return $response->withStatus(404);
        }

        // Validate request body
        if(!isset($request->getParsedBody()['usernameoremail']) || !isset($request->getParsedBody()['password'])) {
            $response->getBody()->write(json_encode(["message" => "Invalid username or email and password"]));
            return $response->withStatus(400);
        }

        $loginType = $this->checkLoginType($request->getParsedBody()['usernameoremail']);
        $usernameoremail = $request->getParsedBody()['usernameoremail'];
        $password = $request->getParsedBody()['password'];

        $passwordComparison = password_verify($password, $doesUserExist['user']['hashedPassword']);
        if(!$passwordComparison) {
            $response->getBody()->write(json_encode(["message" => "Invalid username or email and password"]));
            return $response->withStatus(401);
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = $doesUserExist['user']['userId'];
        $_SESSION['role'] = $doesUserExist['user']['role'];

        $response->getBody()->write(json_encode([
            "message" => "Login successful",
            "user" => [
                "id" => $doesUserExist['user']['userId'],
                "username" => $doesUserExist['user']['username'],
                "role" => $doesUserExist['user']['role']
            ]
        ]));

        return $response->withStatus(200);
    }

    public function logout(Request $request, Response $response) {
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

        $response->getBody()->write(json_encode(["message" => "Logout successful"]));
        return $response->withStatus(200);
    }

    // Returns the endpoint for checking if a user exists in the database
    public function checkUser(Request $request, Response $response) {
        $doesUserExist = $this->checkCredentials($request);
        $returnStatus;
        if($doesUserExist['status'] == 404) {
            $response->getBody()->write(json_encode(["message" => "User not found", "data" => null]));
            $returnStatus = 404;
        } else {
            $response->getBody()->write(json_encode([
                "message" => "User exists",
                "data" => ["userId" => $doesUserExist['user']['userId'],
                "username" => $doesUserExist['user']['username'],
                "email" => $doesUserExist['user']['email'],
                "role" => $doesUserExist['user']['role']]
            ]));
            $returnStatus = 200;
        }
        return $response->withStatus($returnStatus);
    }

    // Checks wether the user exists in the database
    private function checkCredentials(Request $request) {
        $requestBody = $request->getParsedBody();
        $loginValue = null;
        $loginColumn = null;

        if (isset($requestBody['usernameoremail'])) {
            $loginValue = $requestBody['usernameoremail'];
            $loginColumn = $this->checkLoginType($loginValue);
        } elseif (isset($requestBody['username'])) {
            $loginValue = $requestBody['username'];
            $loginColumn = 'username';
        } elseif (isset($requestBody['email'])) {
            $loginValue = $requestBody['email'];
            $loginColumn = 'email';
        }

        if (!$loginValue) return ["status" => 400];

        $stmt = $this->db->prepare("SELECT * FROM users WHERE $loginColumn = :value");
        $stmt->execute(['value' => $loginValue]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if($user) return ["status" => 200, "user" => $user];
        else return ["status" => 404];
    }

    // Returns wether the user gave an email or a username
    private function checkLoginType($usernameOrEmail) {
        if(filter_var($usernameOrEmail, FILTER_VALIDATE_EMAIL)) return "email";
        else return "username";
    }
}
