<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Core\ApiResponse;
use src\Models\userModel;

class ProfileController {
    use ApiResponse;

    private $db;
    private $userModel;

    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->userModel = new userModel($this->db, $_SESSION['userId'] ?? null);
    }

    public function getProfile($request, $response, $args) {
        $identifier = $args['identifier'] ?? null;

        // Get the user
        if (!$identifier && !isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
        $user = $this->userModel->getUser($identifier ?? $_SESSION['userId']);

        if (!$user) return $this->error($response, 'User not found', 404);
        unset($user['email']);

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

        if (!$identifier && !isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
        
        $user = $identifier 
            ? $this->userModel->getUser($identifier) 
            : $this->userModel->getUserById($_SESSION['userId']);

        if (!$user) return $this->error($response, 'User not found', 404);
        if ($user['role'] !== 'Client') return $this->error($response, 'Forbidden: Not a client', 403);

        $posts = $this->userModel->getClientPosts($user['userId']);

        $response->getBody()->write(json_encode(['clientPosts' => $posts]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function updateProfile($request, $response) {
        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
        
        $actions = $request->getParsedBody() ?? [];
        if (!is_array($actions)) return $this->error($response, 'Invalid profile update payload', 400);

        $this->userModel->updateUser($actions);

        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function updateProfilePicture($request, $response) {
        if(!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);

        $me = $this->userModel->getUserById($_SESSION['userId']);
        if(!$me) return $this->error($response, 'Unauthorized', 401);
        
        $uploadedFiles = $request->getUploadedFiles();
        $uploadedFile  = $uploadedFiles['profilePicture'] ?? null;
        $allowedTypes  = ['image/jpeg' => 'jpg', 'image/png' => 'png'];
        $maxFileSize   = 2.5 * 1024 * 1024; // 2.5 MB
        $uploadsDir    = __DIR__ . '/../../uploads/';

        if(!$uploadedFile) return $this->error($response, 'No file uploaded', 400);
        if($uploadedFile->getError() !== UPLOAD_ERR_OK) return $this->error($response, 'File upload failed', 400);
        $extension = $allowedTypes[$uploadedFile->getClientMediaType()] ?? null;
        if(!$extension) return $this->error($response, 'Invalid file type, only JPEG and PNG are allowed', 400);
        if($uploadedFile->getSize() > $maxFileSize) return $this->error($response, 'File size exceeds the limit of 2.5MB', 400);
        if(!is_dir($uploadsDir)) mkdir($uploadsDir, 0775, true);

        $filename = 'profile_' . $_SESSION['userId'] . '_' . bin2hex(random_bytes(8)) . '.' . $extension;

        $filePath = $uploadsDir . $filename;
        $uploadedFile->moveTo($filePath);

        $relativePath = '/uploads/' . $filename;
        $this->userModel->updateUser([
            ['type' => 'update-profile-picture', 'profilePicture' => $relativePath]
        ]);

        $response->getBody()->write(json_encode([
            'success' => true,
            'profilePicture' => $relativePath,
            'url' => $relativePath
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
}
