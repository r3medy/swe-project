<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Models\userModel;

// ? Completed
class ProfileController {
    private $db;
    private $userModel;

    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->userModel = new userModel($this->db, $_SESSION['userId'] ?? null);
    }

    public function getProfile($request, $response, $args) {
        $identifier = $args['identifier'] ?? null;

        // Determine user
        if (!$identifier && !isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
        $user = $this->userModel->getUser($identifier ?? $_SESSION['userId']);

        if (!$user) return $this->error($response, 'User not found', 404);

        // Get user tags
        $user['tags'] = $this->userModel->getUserTags($user['userId']);

        $response->getBody()->write(json_encode(['user' => $user]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
    
    public function getSavedPosts($request, $response) {
        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
        $posts = $this->userModel->getSavedPosts($_SESSION['userId']);

        $response->getBody()->write(json_encode(['savedPosts' => $posts]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function getClientPosts($request, $response, $args) {
        $identifier = $args['identifier'] ?? null;
        $user = null;

        // Determine user
        if (!$identifier && !isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
        $user = $this->userModel->getUser($identifier ?? $_SESSION['userId']);

        if (!$user) return $this->error($response, 'User not found', 404);
        if ($user['role'] !== 'Client') return $this->error($response, 'Forbidden: Not a client', 403);

        $posts = $this->userModel->getClientPosts($user['userId']);

        $response->getBody()->write(json_encode(['clientPosts' => $posts]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function updateProfile($request, $response) {
        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
        
        $actions = $request->getParsedBody();
        $this->userModel->updateUser($actions);

        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function updateProfilePicture($request, $response) {
        $me = $this->userModel->getUser($_SESSION['userId']);
        if(!isset($_SESSION['userId']) && $me['role'] !== 'Admin') return $this->error($response, 'Unauthorized', 401);
        
        $uploadedFiles = $request->getUploadedFiles();
        $uploadedFile  = $uploadedFiles['profilePicture'] ?? null;
        $allowedTypes  = ['image/jpeg', 'image/png'];
        $maxFileSize   = 2.5 * 1024 * 1024; // 2.5 MB
        $uploadsDir    = __DIR__ . '/../../uploads/';

        if(!$uploadedFile) return $this->error($response, 'No file uploaded', 400);
        if($uploadedFile->getError() !== UPLOAD_ERR_OK) return $this->error($response, 'File upload failed', 400);
        if(!in_array($uploadedFile->getClientMediaType(), $allowedTypes)) return $this->error($response, 'Invalid file type, only JPEG and PNG are allowed', 400);
        if($uploadedFile->getSize() > $maxFileSize) return $this->error($response, 'File size exceeds the limit of 2.5MB', 400);

        $ext = pathinfo($uploadedFile->getClientFilename(), PATHINFO_EXTENSION);
        $filename = $_SESSION['userId'] . '.' . $ext;

        $filePath = $uploadsDir . $filename;
        $uploadedFile->moveTo($filePath);

        $relativePath = '/uploads/' . $filename;
        $this->userModel->updateUser([
            ['type' => 'update-profile-picture', 'profilePicture' => $relativePath]
        ]);

        $response->getBody()->write(json_encode([
            'success' => true,
            'profilePicture' => $relativePath
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    private function error($response, $message, $status) {
        $response->getBody()->write(json_encode(['error' => $message]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}
