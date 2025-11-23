<?php

namespace src\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;
use PDO;

class FreelancerController {
    private $db;
    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
    }
}
