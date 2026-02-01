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

    public function createPost($clientId, $postDetails) {
        $title         = $postDetails["title"];
        $description   = $postDetails["description"];
        $paymentMethod = $postDetails["paymentMethod"] === "Fixed" ? "Fixed" : "Hourly";
        $paymentType   = $paymentMethod === "Fixed" ? "budget" : "hourlyRate";
        $paymentAmount = $postDetails["paymentAmount"];
        $tags = explode(",", $postDetails["tags"]);

        $query = $this->db->prepare("INSERT INTO posts (clientId, jobTitle, jobDescription, jobType, $paymentType, status) VALUES (:clientId, :jobTitle, :jobDescription, :jobType, :$paymentType, 'Pending')");
        $query->execute([
            'clientId' => $clientId,
            'jobTitle' => $title,
            'jobDescription' => $description,
            'jobType' => $paymentMethod,
            $paymentType => $paymentAmount,
        ]);

        $postId = $this->db->lastInsertId();

        foreach($tags as $tag) {
            $stmt = $this->db->prepare('INSERT INTO posttags (postId, tagId) VALUES (:postId, :tagId)');
            $stmt->execute([
                'postId' => $postId,
                'tagId' => $tag
            ]);
        }

        return $postId;
    }

    public function setThumbnailForPost($thumbnail, $postId) {
        $extension  = pathinfo($thumbnail->getClientFilename(), PATHINFO_EXTENSION);
        $uploadsDir = __DIR__ . '/../../uploads/';
        $fileName   = "post_" . $postId . "." . $extension;
        $filePath   = $uploadsDir . $fileName;
        $relativePath = '/uploads/' . $fileName;

        $thumbnail->moveTo($filePath);

        $query = $this->db->prepare("UPDATE posts SET jobThumbnail = :jobThumbnail WHERE postId = :postId");
        $query->execute([
            'jobThumbnail' => $relativePath,
            'postId' => $postId,
        ]);

        return ["status" => 200, "message" => "Thumbnail Set"];
    }

    public function deletePostFromUser($userId, $postId) {
        $query = $this->db->prepare("DELETE FROM posts WHERE postId = :postId AND clientId = :clientId");
        $query->execute([
            'postId' => $postId,
            'clientId' => $userId,
        ]);
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

    public function savePost($userId, $postId) {
        $stmt = $this->db->prepare("INSERT INTO savedPosts (userId, postId) VALUES (:userId, :postId)");
        $stmt->execute([
            'userId' => $userId,
            'postId' => $postId,
        ]);
        return ["status" => 200, "message" => "Post Saved"];
    }

    public function removeSavedPost($userId, $postId) {
        $stmt = $this->db->prepare("DELETE FROM savedPosts WHERE userId = :userId AND postId = :postId");
        $stmt->execute([
            'userId' => $userId,
            'postId' => $postId,
        ]);
        return ["status" => 200, "message" => "Post Un-saved"];
    }

    public function isPostSaved($userId, $postId) {
        $stmt = $this->db->prepare("SELECT * FROM savedPosts WHERE userId = :userId AND postId = :postId");
        $stmt->execute([
            'userId' => $userId,
            'postId' => $postId,
        ]);
        
        return $stmt->rowCount() > 0;
    }

    public function getClientId($postId) {
        $stmt = $this->db->query("SELECT clientId FROM posts WHERE postId = $postId");
        return $stmt->fetchColumn();
    }

    public function markJobAccepted($postId) {
        $stmt = $this->db->prepare("UPDATE posts SET isJobAccepted = 1 WHERE postId = :postId");
        $stmt->execute([':postId' => $postId]);
        return $stmt->rowCount();
    }
}
