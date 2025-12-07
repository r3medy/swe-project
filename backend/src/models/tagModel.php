<?php
namespace src\Models;

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

    public function getAllTags() {
        $stmt = $this->db->prepare("SELECT * FROM tags");
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
