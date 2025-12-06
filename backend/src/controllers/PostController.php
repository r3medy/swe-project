<?php

namespace src\Controllers;

use PDO;
use Psr\Container\ContainerInterface;

class PostController {
    private $db;
    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
    }

    public function getAllPosts($request, $response) {

    }
}
