<?php

namespace src\Controllers;

use PDO;



class ProfileController
{
    private $db;
    public function __construct($container)
    {
        $this->db = $container->get('db');
    }

    // read the identifier (@username or ID) from route

    public function getProfile($request, $response, $args)
    {
        $identifier = $args['identifier'] ?? null;

        if (!$identifier) {
            // identiifer =null  take from session 
            if (!isset($_SESSION['userId'])) {
                // if session end or user dont login --> error message
                return $this->error($response, 'Unauthorized', 401);
            }
            //save user ID and search with user ID in database column 
            $userId = $_SESSION['userId'];
            $stmt = $this->db->prepare("SELECT userId, username, createdAt, role, firstName, lastName, title, country, bio, email FROM Users WHERE userId = :id");
            $stmt->execute([':id' => $userId]);
        }

        // if identifier = number --> user ID
        else if (is_numeric($identifier)) {
            $stmt = $this->db->prepare("SELECT userId, username, createdAt, role, firstName, lastName, title, country, bio, email FROM Users WHERE userId = :id");
            $stmt->execute([':id' => $identifier]);
        }

        // if identifier --> start with @ --> username
        else if (str_starts_with($identifier, '@')) {
            $username = substr($identifier, 1);
            $stmt = $this->db->prepare("SELECT userId, username, createdAt, role, firstName, lastName, title, country, bio, email FROM Users WHERE username = :username");
            $stmt->execute([':username' => $username]);
        }

        //if identifier != number || start with @ --> error message
        else {
            return $this->error($response, 'Invalid identifier', 400);
        }

        // bring first row in inquiry
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user)
            return $this->error($response, 'User not found', 404);

        $tagsStmt = $this->db->prepare("
            SELECT t.tagId, t.tagName 
            FROM usertags ut
            JOIN tags t ON ut.tagId = t.tagId
            WHERE ut.userId = :userId
        ");
        $tagsStmt->execute([':userId' => $user['userId']]);
        $tags = $tagsStmt->fetchAll(PDO::FETCH_ASSOC);

        $user['tags'] = $tags;

        $response->getBody()->write(json_encode(['user' => $user]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
    public function getSavedPosts($request, $response)
    {
        if (!isset($_SESSION['userId']))
            return $this->error($response, 'Unauthorized', 401);
        $userId = $_SESSION['userId'];
        $stmt = $this->db->prepare("
            SELECT p.postId, p.jobTitle AS title, p.jobDescription AS description, p.createdAt, p.budget, p.hourlyRate, p.status
            FROM savedPosts sp
            JOIN posts p ON sp.postId = p.postId
            WHERE sp.userId = :userId
        ");
        $stmt->execute([':userId' => $userId]);
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode(['savedPosts' => $posts]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function getClientPosts($request, $response, $args)
    {
        $identifier = $args['identifier'] ?? null;
        $userId = null;

        if (!$identifier) {
            $userId = $_SESSION['userId'] ?? null;
        } elseif (is_numeric($identifier)) {
            $userId = $identifier;
        } elseif (str_starts_with($identifier, '@')) {
            $username = substr($identifier, 1);
            $stmt = $this->db->prepare("SELECT userId FROM users WHERE username = :username");
            $stmt->execute([':username' => $username]);
            $userId = $stmt->fetchColumn();
        }

        if (!$userId) {
            return $this->error($response, 'User not found', 404);
        }

        $stmtRole = $this->db->prepare("SELECT role FROM users WHERE userId = :id");
        $stmtRole->execute([':id' => $userId]);
        $role = $stmtRole->fetchColumn();

        if ($role !== 'Client')
            return $this->error($response, 'Forbidden: Not a client', 403);

        $stmt = $this->db->prepare("
            SELECT postId, clientId, jobTitle AS title, jobType, jobDescription AS description, budget, hourlyRate, status, isJobAccepted, createdAt 
            FROM posts 
            WHERE clientId = :userId
        ");
        $stmt->execute([':userId' => $userId]);
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode(['clientPosts' => $posts]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function updateProfile($request, $response)
    {
        if (!isset($_SESSION['userId']))
            return $this->error($response, 'Unauthorized', 401);

        // [["type" => "edit-bio", "bio" => "new bio"],
        // ["type" => "remove-tag", "tagId" => 1],
        // ["type" => "add-tag", "tagId" => 2]]
        $userId = $_SESSION['userId'];
        $actions = $request->getParsedBody();

        foreach ($actions as $action) {
            switch ($action['type']) {
                case 'edit-bio':
                    $bio = $action['bio'];
                    $stmt = $this->db->prepare("UPDATE Users SET bio = :bio WHERE userId = :userId");
                    $stmt->execute([':bio' => $bio, ':userId' => $userId]);
                    break;
                case 'remove-tag':
                    $tagId = $action['tagId'];
                    $stmt = $this->db->prepare("DELETE FROM usertags WHERE userId = :userId AND tagId = :tagId");
                    $stmt->execute([':userId' => $userId, ':tagId' => $tagId]);
                    break;
                case 'add-tag':
                    $tagId = $action['tagId'];
                    $stmt = $this->db->prepare("INSERT INTO usertags (userId, tagId) VALUES (:userId, :tagId)");
                    $stmt->execute([':userId' => $userId, ':tagId' => $tagId]);
                    break;
                case 'change-title':
                    $title = $action['title'];
                    $stmt = $this->db->prepare("UPDATE Users SET title = :title WHERE userId = :userId");
                    $stmt->execute([':title' => $title, ':userId' => $userId]);
                    break;
                case 'remove-saved-post':
                    $postId = $action['postId'];
                    $stmt = $this->db->prepare("DELETE FROM savedPosts WHERE userId = :userId AND postId = :postId");
                    $stmt->execute([':userId' => $userId, ':postId' => $postId]);
                    break;
            }
        }

        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
    private function error($response, $message, $status)
    {
        $response->getBody()->write(json_encode(['error' => $message]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}





