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
        
    }

    public function login(Request $request, Response $response) {
        
    }
}
