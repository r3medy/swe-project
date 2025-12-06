<?php

namespace src\Models;

use src\Core\Validator;
use PDO;

class userModel {
    private $validator;

    // Constructor
    public function __construct(private $db, private $userId) {
        $this->validator = new Validator();
    }

    // Getting user info by Id
    public function getUserById($userId, $public = true) {
        $user = $this->getUserFromDB("userId", $userId);
        if($public && $user) unset($user["hashedPassword"]);
        return $user;
    }
    
    // Getting user info by Username
    public function getUserByUsername($username, $public = true) {
        $user = $this->getUserFromDB("username", $username);
        if($public && $user) unset($user["hashedPassword"]);
        return $user;
    }

    // Getting user info by Email 
    public function getUserByEmail($email, $public = true) {
        $user = $this->getUserFromDB("email", $email);
        if($public && $user) unset($user["hashedPassword"]);
        return $user;
    }

    // Getting user info, detecting whichever login method 
    public function getUser($loginField, $public = true) {
        $loginMethod = $this->inferLoginMethod($loginField);
        $user = $this->getUserFromDB($loginMethod, $loginField);
        if($public && $user) unset($user["hashedPassword"]);
        return $user;
    }

    // User management
    public function storeUser($data) {
        $requiredFields = ['username', 'email', 'password', 'role', 'gender', 'firstName', 'lastName', 'title', 'country', 'bio'];
        foreach($requiredFields as $field) {
            $this->validator->validate($field, $data[$field] ?? null);
        }
        
        $validationErrors = $this->validator->errors;
        if(count($validationErrors) > 0) return ["status" => 400, "message" => "Validation failed", "errors" => $validationErrors];
        if($this->getUserByEmail($data["email"]) || $this->getUserByUsername($data["username"])) return ["status" => 400, "message" => "User already exists"];

        $stmt = $this->db->prepare("INSERT INTO users (username, email, hashedPassword, role, gender, firstName, lastName, title, country, bio) VALUES (:username, :email, :hashedPassword, :role, :gender, :firstName, :lastName, :title, :country, :bio)");
        $stmt->execute([
            ':username' => $data["username"],
            ':email' => $data["email"],
            ':hashedPassword' => password_hash($data["password"], PASSWORD_DEFAULT),
            ':role' => $data["role"],
            ':gender' => $data["gender"],
            ':firstName' => $data["firstName"],
            ':lastName' => $data["lastName"],
            ':title' => $data["title"],
            ':country' => $data["country"],
            ':bio' => $data["bio"]
        ]);

        return ["status" => 201, "message" => "User created successfully"];
    }

    
    // $changes = [["type" => "edit-bio", "bio" => "new bio"],
    //  ["type" => "remove-tag", "tagId" => tagId],
    //  ["type" => "add-tag", "tagId" => tagId],
    //  ["type" => "change-title", "title" => "new title"],
    //  ["type" => "remove-saved-post", "postId" => postId]]
    public function updateUser($changes) {
        foreach($changes as $change) {
            $type = $change["type"];
            switch($type) {
                case "edit-bio":
                    $bio = $change["bio"];
                    $stmt = $this->db->prepare("UPDATE users SET bio = :bio WHERE userId = :userId");
                    $stmt->execute([':bio' => $bio, ':userId' => $this->userId]);
                    break;
                case "remove-tag":
                    $tagId = $change["tagId"];
                    $stmt = $this->db->prepare("DELETE FROM usertags WHERE userId = :userId AND tagId = :tagId");
                    $stmt->execute([':userId' => $this->userId, ':tagId' => $tagId]);
                    break;
                case "add-tag":
                    $tagId = $change["tagId"];
                    $stmt = $this->db->prepare("INSERT INTO usertags (userId, tagId) VALUES (:userId, :tagId)");
                    $stmt->execute([':userId' => $this->userId, ':tagId' => $tagId]);
                    break;
                case "change-title":
                    $title = $change["title"];
                    $stmt = $this->db->prepare("UPDATE users SET title = :title WHERE userId = :userId");
                    $stmt->execute([':title' => $title, ':userId' => $this->userId]);
                    break;
                case "remove-saved-post":
                    $postId = $change["postId"];
                    $stmt = $this->db->prepare("DELETE FROM savedposts WHERE userId = :userId AND postId = :postId");
                    $stmt->execute([':userId' => $this->userId, ':postId' => $postId]);
                    break;
            }
        }
    }

    public function changePassword($oldPassword, $newPassword) {
        $user = $this->getUserById($this->userId, false);
        if(!$user) return ["status" => 404, "message" => "User not found"];
        if(!password_verify($oldPassword, $user['hashedPassword'])) return ["status" => 400, "message" => "Old password is incorrect"];

        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);

        $stmt = $this->db->prepare("UPDATE users SET hashedPassword = :newPass WHERE userId = :id");
        $stmt->execute([
            ":newPass" => $newHash,
            ":id" => $this->userId
        ]);

        if($stmt->rowCount() > 0) return ["status" => 200, "message" => "Password changed successfully"];
        return ["status" => 500, "message" => "Failed to change password"];
    }

    public function deleteUser($userId) {
        $user = $this->getUserById($userId);
        if(!$user) return ["status" => 404, "message" => "User not found"];
        if($user['role'] !== "Admin") return ["status" => 401, "message" => "Unauthorized"];
        
        $stmt = $this->db->prepare("DELETE FROM users WHERE userId = :userId");
        $stmt->execute([':userId' => $userId]);
        
        if($stmt->rowCount() > 0) return ["status" => 200, "message" => "User deleted successfully"];
        return ["status" => 500, "message" => "Failed to delete user"];
    }

    // Helper methods
    private function inferLoginMethod($logincreds) {
        return filter_var($logincreds, FILTER_VALIDATE_EMAIL) ? "email" : (is_numeric($logincreds) ? "userId" : "username");
    }

    private function getUserFromDB($loginmethod, $value) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE $loginmethod = :value");
        if(str_starts_with($value, "@")) $stmt->execute(['value' => substr($value, 1)]);
        else $stmt->execute(['value' => $value]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user;
    }
}
