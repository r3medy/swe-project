<?php

namespace src\Controllers;

use PDO;

class AdminController
{
    private $db;
    public function __construct($container)
    {
        $this->db = $container->get('db');
    }

    public function getAllPosts($request, $response)
    {
    }
}
