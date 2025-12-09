<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Models\chatModel;

class ChatController {
    private $db;
    private $chatModel;
    
    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->chatModel = new chatModel($this->db);
    }

    private function error($response, $message, $status) {
        $response->getBody()->write(json_encode(['error' => $message]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    // GET /chat/{postId} - Get all messages for a chat
    public function getChatMessages($request, $response, $args) {
        if (!isset($_SESSION['userId'])) {
            return $this->error($response, 'Unauthorized', 401);
        }

        $postId = $args['postId'] ?? null;
        if (!$postId) {
            return $this->error($response, 'Post ID required', 400);
        }

        $messages = $this->chatModel->getChats($postId);
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'messages' => $messages
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    // POST /chat/{postId} - Send a message
    public function sendMessage($request, $response, $args) {
        if (!isset($_SESSION['userId'])) {
            return $this->error($response, 'Unauthorized', 401);
        }

        $postId = $args['postId'] ?? null;
        if (!$postId) {
            return $this->error($response, 'Post ID required', 400);
        }

        $body = json_decode($request->getBody()->getContents(), true);
        $content = $body['content'] ?? null;

        if (!$content || trim($content) === '') {
            return $this->error($response, 'Message content required', 400);
        }

        $result = $this->chatModel->sendMessage($postId, $content, $_SESSION['userId']);

        if (isset($result['error'])) {
            return $this->error($response, $result['error'], $result['status'] ?? 400);
        }

        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }
}

