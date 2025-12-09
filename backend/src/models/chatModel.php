<?php

namespace src\Models;
use PDO;
use src\Models\userModel;

class chatModel {
    private $userModel;

    public function __construct(private $db) {
        $this->userModel = new userModel($this->db, $_SESSION['userId'] ?? null);
    }

    public function getChats($postId) {
        $query = $this->db->prepare("SELECT * FROM chatLogs WHERE postId = :postId ORDER BY sentAt ASC");
        $query->execute(['postId' => $postId]);
        
        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    public function sendMessage($postId, $content, $senderId) {
        $sender = $this->userModel->getUserById($senderId);
        if (!$sender) return ['status' => 404, 'error' => 'User not found'];
        $senderRole = $sender['role']; // 'Freelancer' or 'Client'

        $participants = $this->getChatParticipants($postId);
        if (!$participants) return ['status' => 404, 'error' => 'No chat exists for this post'];

        $query = $this->db->prepare('
            INSERT INTO chatLogs (postId, freelancerId, clientId, sender, content) 
            VALUES (:postId, :freelancerId, :clientId, :sender, :content)
        ');
        
        $query->execute([
            'postId'       => $postId,
            'freelancerId' => $participants['freelancerId'],
            'clientId'     => $participants['clientId'],
            'sender'       => $senderRole,
            'content'      => $content
        ]);

        return [
            'success'   => true,
            'messageId' => $this->db->lastInsertId()
        ];
    }

    public function getChatParticipants($postId) {
        $query = $this->db->prepare("
            SELECT pr.freelancerId, p.clientId
            FROM proposals pr
            JOIN posts p ON pr.postId = p.postId
            WHERE pr.postId = :postId AND pr.status = 'Accepted'
            LIMIT 1
        ");
        $query->execute(['postId' => $postId]);
        return $query->fetch(PDO::FETCH_ASSOC);
    }
}
