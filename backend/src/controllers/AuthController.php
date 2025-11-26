<?php

namespace src\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;
use PDO;

class AuthController {
    private $db;
    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
    }
    
    public function register(Request $request, Response $response) {
        // 1. Validate the request
        // 2. Check if username exists
        // 3. Check if email exists
        // 4. Hash the password
        // 5. Create the user
        // 6. Return the user
    }

    public function login(Request $request, Response $response) {
        
    }
}
