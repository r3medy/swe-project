<?php

namespace src\Models;
use PDO;

class chatModel {
    public function __construct(private $db) {}

    public function getFullChats($userId) {
        // Get all chats where user is either freelancer or client
        $chatsQuery = $this->db->prepare("
            SELECT 
                c.chatId,
                c.postId,
                c.createdAt AS chatCreatedAt,
                p.jobTitle,
                p.jobType,
                f.userId AS freelancerId,
                f.firstName AS freelancerFirstName,
                f.lastName AS freelancerLastName,
                f.username AS freelancerUsername,
                f.profilePicture AS freelancerProfilePicture,
                f.gender AS freelancerGender,
                cl.userId AS clientId,
                cl.firstName AS clientFirstName,
                cl.lastName AS clientLastName,
                cl.username AS clientUsername,
                cl.profilePicture AS clientProfilePicture,
                cl.gender AS clientGender
            FROM chats c
            JOIN posts p ON c.postId = p.postId
            JOIN users f ON c.freelancerId = f.userId
            JOIN users cl ON c.clientId = cl.userId
            WHERE c.freelancerId = :userId OR c.clientId = :userId2
            ORDER BY c.createdAt DESC
        ");
        $chatsQuery->execute([
            "userId" => $userId,
            "userId2" => $userId
        ]);
        $chats = $chatsQuery->fetchAll(PDO::FETCH_ASSOC);

        $messagesByChat = [];
        $chatIds = array_column($chats, 'chatId');
        if (!empty($chatIds)) {
            $placeholders = implode(',', array_fill(0, count($chatIds), '?'));
            $messagesQuery = $this->db->prepare("
                SELECT 
                    m.chatId,
                    m.messageId,
                    m.senderId,
                    m.messageContent,
                    m.sentAt,
                    u.firstName AS senderFirstName,
                    u.lastName AS senderLastName,
                    u.username AS senderUsername,
                    u.profilePicture AS senderProfilePicture
                FROM messages m
                JOIN users u ON m.senderId = u.userId
                WHERE m.chatId IN ($placeholders)
                ORDER BY m.chatId ASC, m.sentAt ASC
            ");
            $messagesQuery->execute(array_values($chatIds));

            foreach ($messagesQuery->fetchAll(PDO::FETCH_ASSOC) as $message) {
                $messagesByChat[$message['chatId']][] = $message;
            }
        }

        $result = [];
        foreach ($chats as $chat) {
            $result[] = [
                "chatId" => $chat["chatId"],
                "createdAt" => $chat["chatCreatedAt"],
                "post" => [
                    "postId" => $chat["postId"],
                    "jobTitle" => $chat["jobTitle"],
                    "jobType" => $chat["jobType"]
                ],
                "freelancer" => [
                    "userId" => $chat["freelancerId"],
                    "firstName" => $chat["freelancerFirstName"],
                    "lastName" => $chat["freelancerLastName"],
                    "username" => $chat["freelancerUsername"],
                    "profilePicture" => $chat["freelancerProfilePicture"],
                    "gender" => $chat["freelancerGender"]
                ],
                "client" => [
                    "userId" => $chat["clientId"],
                    "firstName" => $chat["clientFirstName"],
                    "lastName" => $chat["clientLastName"],
                    "username" => $chat["clientUsername"],
                    "profilePicture" => $chat["clientProfilePicture"],
                    "gender" => $chat["clientGender"]
                ],
                "messages" => $messagesByChat[$chat["chatId"]] ?? []
            ];
        }

        return $result;
    }

    public function newChat($postId, $freelancerId, $clientId) {
        $query = $this->db->prepare("INSERT INTO chats (postId, freelancerId, clientId) VALUES (:postId, :freelancerId, :clientId)");
        $query->execute([
            "postId" => $postId,
            "freelancerId" => $freelancerId,
            "clientId" => $clientId
        ]);
        
        return $this->db->lastInsertId();
    }

    public function sendMessage($chatId, $userId, $message) {
        $query = $this->db->prepare("INSERT INTO messages (chatId, senderId, messageContent) VALUES (:chatId, :senderId, :messageContent)");
        
        return $query->execute([
            "chatId" => $chatId,
            "senderId" => $userId,
            "messageContent" => trim($message)
        ]);
    }

    public function getChatParticipants($chatId) {
        $query = $this->db->prepare("SELECT freelancerId, clientId FROM chats WHERE chatId = :chatId");
        $query->execute([
            "chatId" => $chatId
        ]);
        return $query->fetch(PDO::FETCH_ASSOC);
    }
}
