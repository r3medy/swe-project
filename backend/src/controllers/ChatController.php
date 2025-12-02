<?php

namespace src\Controllers;

use PDO;

class ChatController
{
    private $db;
    public function __construct($container)
    {
        $this->db = $container->get('db');
    }
}
