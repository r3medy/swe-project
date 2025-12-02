<?php

namespace src\Controllers;

use PDO;

class TagController
{
    private $db;
    public function __construct($container)
    {
        $this->db = $container->get('db');
    }

    public function getTags($request, $response, $args)
    {
        try {
            $stmt = $this->db->prepare("SELECT * FROM tags");
            $stmt->execute();
            $tags = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $response->getBody()->write(json_encode($tags));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }
}
