<?php

namespace src\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;
use PDO;

class TagController
{
    private $db;
    public function __construct(ContainerInterface $container)
    {
        $this->db = $container->get('db');
    }

    public function getTags(Request $request, Response $response, array $args): Response
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
