<?php
namespace src\Models;
use PDO;

class tagModel {
    // Constructor
    public function __construct(private $db) {}

    public function addTag($tagName) {
        $stmt = $this->db->prepare("INSERT INTO tags (tagName) VALUES (:tagName)");
        $stmt->execute([
            ":tagName" => $tagName
        ]);
    }

    public function removeTagById($tagId) {
        $stmt = $this->db->prepare("DELETE FROM tags WHERE tagId = :tagId");
        $stmt->execute([
            ":tagId" => $tagId
        ]);
    }

    public function editTag($tagId, $newName) {
        $stmt = $this->db->prepare("UPDATE tags SET tagName = :newName WHERE tagId = :tagId");
        $stmt->execute([
            ":newName" => $newName,
            ":tagId" => $tagId
        ]);
    }

    public function findTagByName($name) {
        $stmt = $this->db->prepare("SELECT * FROM tags WHERE tagName = :name");
        $stmt->execute([
            ":name" => $name
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function addTagtoUser($userId, $tagId) {
        $stmt = $this->db->prepare('INSERT INTO usertags (userId, tagId) VALUES (:userId, :tagId)');
        $stmt->execute([
            ':userId' => $userId,
            ':tagId' => $tagId
        ]);
    }

    public function getAllTags($page = 1, $limit = 50) {
        $page = max(1, (int) $page);
        $limit = min(50, max(1, (int) $limit));
        $offset = ($page - 1) * $limit;

        $stmt = $this->db->prepare("SELECT * FROM tags ORDER BY tagName ASC LIMIT ? OFFSET ?");
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll();
    }
}
