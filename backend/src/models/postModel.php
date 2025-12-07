<?php

namespace src\Models;

use PDO;

class postModel {
    public function __construct(private $db) {}

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

    // TODO: add notification to client
    // Accepted, Rejected
    public function updatePostStatus($postId, $status = "Accepted") {
        $query = $this->db->prepare("UPDATE posts SET status = :status WHERE postId = :postId");
        $query->execute(['status' => $status, 'postId' => $postId]);

        return ["status" => 200, "message" => "Post Updated"];
    }
}
