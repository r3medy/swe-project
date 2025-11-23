<?php

namespace src\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;
use PDO;

class PostController {
    private $db;
    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
    }

    public function createPost(Request $request, Response $response) {
        
    }

    public function getApprovedPosts(Request $request, Response $response) {
        
    }

    public function getPendingPosts(Request $request, Response $response) {
        
    }

    public function getPostById(Request $request, Response $response) {
        
    }
}
