<?php

namespace src\Controllers;
use src\Models\wallModel;

use Psr\Container\ContainerInterface;

class WallController {
    private $db;
    private $wallModel;
    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->wallModel = new wallModel($this->db);
    }

    public function getWallPosts($request, $response) {
        $filters = $request->getQueryParams();
        
        // Convert tags from URL to array
        if (!empty($filters['tags'])) {
            $filters['tags'] = explode(',', $filters['tags']);
        }
        
        $posts = $this->wallModel->getPostsByFilter($filters);
        $response->getBody()->write(json_encode($posts));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
