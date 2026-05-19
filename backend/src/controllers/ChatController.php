<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Core\ApiResponse;
use src\Models\chatModel;

class ChatController {
    use ApiResponse;

    private $db;
    private $chatModel;
    
    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->chatModel = new chatModel($this->db);
    }

    public function getUserChats($request, $response) {
        if(!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
        
        $chats = $this->chatModel->getFullChats($_SESSION['userId']);
        $response->getBody()->write(json_encode($chats));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function sendMessage($request, $response, $args) {
        if(!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
        
        $chatId = $args['chatId'] ?? null;
        if(!$chatId) return $this->error($response, 'Chat ID is required', 400);
        
        $participants = $this->chatModel->getChatParticipants($chatId);
        if(!$participants) return $this->error($response, 'Chat not found', 404);
        if($participants['clientId'] != $_SESSION['userId'] && $participants['freelancerId'] != $_SESSION['userId']) return $this->error($response, 'Unauthorized', 401);

        $message = trim((string) (($request->getParsedBody() ?? [])['messageContent'] ?? ''));
        if($message === '') return $this->error($response, 'Message is required', 400);
        
        $this->chatModel->sendMessage($chatId, $_SESSION['userId'], $message);
        $response->getBody()->write(json_encode(['status' => 200, 'message' => 'Message sent successfully']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
}
