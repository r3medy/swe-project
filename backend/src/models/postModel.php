<?php

namespace src\Models;

use PDO;
use src\Models\notificationModel;

class postModel {
    private $notificationModel;
    
    public function __construct(private $db) {
        $this->notificationModel = new notificationModel($this->db);
    }

    public function getPendingPosts() {
        $query = $this->db->query("SELECT posts.*, users.firstName, users.lastName, users.profilePicture, users.username FROM posts JOIN users ON posts.clientId = users.userId WHERE users.role = 'Client' AND posts.status = 'Pending'");
        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    public function deletePost($postId) {
        $query = $this->db->prepare("DELETE FROM posts WHERE postId = :postId");
        $query->execute(['postId' => $postId]);
    }

    public function editPost($postId, $changes) {        
        foreach($changes as $key => $value) {
            $query = $this->db->prepare("UPDATE posts SET $key = :value WHERE postId = :postId");
            $query->execute(['value' => $value, 'postId' => $postId]);
        }
    }

    // Accepted, Rejected
    public function updatePostStatus($postId, $status = "Accepted") {
        $stmt = $this->db->query("SELECT clientId FROM posts WHERE postId = $postId");
        $clientId = $stmt->fetchColumn();

        $query = $this->db->prepare("UPDATE posts SET status = :status WHERE postId = :postId");
        $query->execute(['status' => $status, 'postId' => $postId]);

        $this->notificationModel->addNotification($clientId, "Post status updated: " . $status);

        return ["status" => 200, "message" => "Post Updated"];
    }
}
