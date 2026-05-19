<?php

namespace src\Models;

use src\Core\Validator;
use src\Models\tagModel;
use src\Models\postModel;
use PDO;

class userModel {
    private $validator;
    private $tagModel;
    private $postModel;

    // Constructor
    public function __construct(private $db, private $userId) {
        $this->validator = new Validator();
        $this->tagModel  = new tagModel($db);
        $this->postModel = new postModel($db);
    }

    // Getting all users ( Admin )
    public function getAllUsers($page = 1, $limit = 50) {
        $page = max(1, (int) $page);
        $limit = min(50, max(1, (int) $limit));
        $offset = ($page - 1) * $limit;

        $query = $this->db->prepare("
            SELECT userId, role, firstName, lastName, email, username, title, country, bio, gender, profilePicture, createdAt
            FROM users
            ORDER BY createdAt DESC
            LIMIT ? OFFSET ?
        ");
        $query->execute([$limit, $offset]);
        $users = $query->fetchAll(PDO::FETCH_ASSOC);
        return $users;
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

    // Register a user
    public function storeUser($data, $allowAdmin = false) {
        $this->validator->reset();

        $requiredFields = ['username', 'email', 'password', 'role', 'gender', 'firstName', 'lastName', 'title', 'country', 'bio'];
        foreach($requiredFields as $field) {
            $options = $field === 'role' ? ['allowAdmin' => $allowAdmin] : [];
            $this->validator->validate($field, $data[$field] ?? null, $options);
        }
        
        $validationErrors = $this->validator->errors;
        if(count($validationErrors) > 0) return ["status" => 400, "message" => "Validation failed", "errors" => $validationErrors];
        if($this->getUserByEmail($data["email"]) || $this->getUserByUsername($data["username"])) return ["status" => 400, "message" => "User already exists"];

        $stmt = $this->db->prepare("INSERT INTO users (username, email, hashedPassword, role, gender, firstName, lastName, title, country, bio) VALUES (:username, :email, :hashedPassword, :role, :gender, :firstName, :lastName, :title, :country, :bio)");
        $stmt->execute([
            ':username' => $this->sanitizeText($data["username"]),
            ':email' => $data["email"],
            ':hashedPassword' => $this->hashPassword($data["password"]),
            ':role' => $data["role"],
            ':gender' => $data["gender"],
            ':firstName' => $this->sanitizeText($data["firstName"]),
            ':lastName' => $this->sanitizeText($data["lastName"]),
            ':title' => $this->sanitizeText($data["title"]),
            ':country' => $this->sanitizeText($data["country"]),
            ':bio' => $this->sanitizeText($data["bio"])
        ]);

        $userId = $this->db->lastInsertId();

        $interests = $data['interests'] ?? [];
        if (!is_array($interests)) $interests = [];

        foreach(array_unique($interests) as $interest) {
            $tag = $this->tagModel->findTagByName($interest);
            if ($tag) $this->tagModel->addTagtoUser($userId, $tag['tagId']);
        }

        return ["status" => 201, "message" => "User created successfully"];
    }

    
    // $changes = [["type" => "edit-bio", "bio" => "new bio"],
    //  ["type" => "remove-tag", "tagId" => tagId],
    //  ["type" => "add-tag", "tagId" => tagId],
    //  ["type" => "change-title", "title" => "new title"],
    //  ["type" => "remove-saved-post", "postId" => postId]]
    // Update the user information
    public function updateUser($changes) {
        foreach($changes as $change) {
            if (!is_array($change) || empty($change["type"])) continue;

            $type = $change["type"];
            switch($type) {
                case "edit-bio":
                    $bio = $this->sanitizeText($change["bio"]);
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
                    $title = $this->sanitizeText($change["title"]);
                    $stmt = $this->db->prepare("UPDATE users SET title = :title WHERE userId = :userId");
                    $stmt->execute([':title' => $title, ':userId' => $this->userId]);
                    break;
                case "remove-saved-post":
                    $postId = $change["postId"];
                    $this->postModel->removeSavedPost($this->userId, $postId);
                    break;
                case 'delete-post':
                    $postId = $change['postId'];
                    $this->postModel->deletePostFromUser($this->userId, $postId);
                    break;
                case "update-profile-picture":
                    $profilePicture = $change["profilePicture"];
                    $stmt = $this->db->prepare("UPDATE users SET profilePicture = :profilePicture WHERE userId = :userId");
                    $stmt->execute([':profilePicture' => $profilePicture, ':userId' => $this->userId]);
                    break;
            }
        }
    }

    // Change password
    public function changePassword($oldPassword, $newPassword) {
        $user = $this->getUserById($this->userId, false);
        if(!$user) return ["status" => 404, "message" => "User not found"];
        if(!password_verify($oldPassword, $user['hashedPassword'])) return ["status" => 400, "message" => "Old password is incorrect"];

        if (!$this->isStrongPassword($newPassword)) return ["status" => 400, "message" => "Password must be at least 8 characters long and include mixed case plus a digit or special character"];

        $newHash = $this->hashPassword($newPassword);

        $stmt = $this->db->prepare("UPDATE users SET hashedPassword = :newPass WHERE userId = :id");
        $stmt->execute([
            ":newPass" => $newHash,
            ":id" => $this->userId
        ]);

        if($stmt->rowCount() > 0) return ["status" => 200, "message" => "Password changed successfully"];
        return ["status" => 500, "message" => "Failed to change password"];
    }

    // Get user tags
    public function getUserTags($userId) {
        $stmt = $this->db->prepare("
            SELECT t.tagId, t.tagName 
            FROM usertags ut
            JOIN tags t ON ut.tagId = t.tagId
            WHERE ut.userId = :userId
        ");
        $stmt->execute([':userId' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get user saved posts
    public function getSavedPosts($userId) {
        $stmt = $this->db->prepare("
            SELECT p.postId, p.jobTitle AS title, p.jobThumbnail, p.jobDescription AS description, p.createdAt, p.budget, p.hourlyRate, p.status
            FROM savedPosts sp
            JOIN posts p ON sp.postId = p.postId
            WHERE sp.userId = :userId
        ");
        $stmt->execute([':userId' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get client's posts (excluding accepted jobs for proposals view)
    public function getClientPosts($userId) {
        $stmt = $this->db->prepare("
            SELECT postId, clientId, jobTitle AS title, jobType, jobDescription AS description, jobThumbnail, budget, hourlyRate, status, isJobAccepted, createdAt 
            FROM posts 
            WHERE clientId = :userId AND isJobAccepted = 0
        ");
        $stmt->execute([':userId' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Delete a user (Admin function)
    public function deleteUser($userId) {
        $user = $this->getUserById($userId);
        if(!$user) return ["status" => 404, "message" => "User not found"];
        
        $stmt = $this->db->prepare("DELETE FROM users WHERE userId = :userId");
        $stmt->execute([':userId' => $userId]);
        
        if($stmt->rowCount() > 0) return ["status" => 200, "message" => "User deleted successfully"];
        return ["status" => 500, "message" => "Failed to delete user"];
    }

    // Update user by admin
    public function updateUserByAdmin($userId, $data) {
        if (!$this->getUserById($userId)) return ["status" => 404, "message" => "User not found"];

        $allowedFields = ['firstName', 'lastName', 'username', 'email', 'title', 'country', 'role', 'gender', 'bio'];
        $updates = [];
        $params = [':userId' => $userId];

        $this->validator->reset();
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $options = $field === 'role' ? ['allowAdmin' => true] : [];
                $this->validator->validate($field, $data[$field], $options);
            }
        }

        if (count($this->validator->errors) > 0) {
            return ["status" => 400, "message" => "Validation failed", "errors" => $this->validator->errors];
        }

        if (isset($data['email'])) {
            $existing = $this->getUserByEmail($data['email']);
            if ($existing && (int) $existing['userId'] !== (int) $userId) {
                return ["status" => 400, "message" => "Email already exists"];
            }
        }

        if (isset($data['username'])) {
            $existing = $this->getUserByUsername($data['username']);
            if ($existing && (int) $existing['userId'] !== (int) $userId) {
                return ["status" => 400, "message" => "Username already exists"];
            }
        }
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = in_array($field, ['email', 'role', 'gender'], true)
                    ? $data[$field]
                    : $this->sanitizeText($data[$field]);
            }
        }
        
        if (empty($updates)) {
            return ["status" => 400, "message" => "No fields to update"];
        }
        
        $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE userId = :userId";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return ["status" => 200, "message" => "User updated successfully"];
    }

    // Helper methods
    // Infer login method
    private function inferLoginMethod($logincreds) {
        return filter_var($logincreds, FILTER_VALIDATE_EMAIL) ? "email" : (is_numeric($logincreds) ? "userId" : "username");
    }

    // Get user from database using any login method
    private function getUserFromDB($loginmethod, $value) {
        if ($value === null || $value === '') return false;
        if (!in_array($loginmethod, ['userId', 'username', 'email'], true)) return false;

        $queries = [
            'userId' => "SELECT * FROM users WHERE userId = :value",
            'username' => "SELECT * FROM users WHERE username = :value",
            'email' => "SELECT * FROM users WHERE email = :value",
        ];

        $stmt = $this->db->prepare($queries[$loginmethod]);
        if(str_starts_with((string) $value, "@")) $stmt->execute(['value' => substr((string) $value, 1)]);
        else $stmt->execute(['value' => $value]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user;
    }

    private function hashPassword($password) {
        $algorithm = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
        return password_hash($password, $algorithm);
    }

    private function isStrongPassword($password) {
        return is_string($password)
            && strlen($password) >= 8
            && preg_match('/[a-z]/', $password)
            && preg_match('/[A-Z]/', $password)
            && preg_match('/[\d\W_]/', $password);
    }

    private function sanitizeText($value) {
        return trim(strip_tags((string) $value));
    }
}
