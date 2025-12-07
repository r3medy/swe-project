<?php

namespace src\Controllers;

use PDO;
use Psr\Container\ContainerInterface;

class ChatController {
    private $db;
    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
    }
}
