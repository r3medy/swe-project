<?php

namespace src\Models;
use PDO;

class notificationModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Get all notifications
    public function getAll($userId) {
       $stmt = $this->db->prepare("SELECT * FROM notifications WHERE userId = :userId ORDER BY createdAt DESC");
       
       $stmt->execute(['userId' => $userId]);
       return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Mark ALL notifications as read
    public function markAllRead($userId) {
         $stmt = $this->db->prepare("
            UPDATE notifications
            SET isMarkedRead = 1
            WHERE userId = :userId AND isMarkedRead = 0
        ");
        $stmt->execute(['userId' => $userId]);

        return ["status" => 200, "message" => "Marked all notifications as read"];
    }

    // Delete a notification
    public function delete($notificationId, $userId) {
         $stmt = $this->db->prepare("DELETE FROM notifications WHERE
          notificationId = :notificationId AND userId = :userId"
          );
        $stmt->execute([
            'notificationId' => $notificationId, 
            'userId' => $userId
        ]);
        
        return ["status" => 200, "message" => "Notification deleted"];
    }

    // Add notification
    public function addNotification($userId, $content) {
        $stmt = $this->db->prepare("INSERT INTO notifications (userId, content, isMarkedRead) VALUES (:userId, :content, 0)");
        $stmt->execute([
            'userId' => $userId,
            'content' => $content
        ]);

        return ["status" => 200, "message" => "Notification added"];
    }
}
