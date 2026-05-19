<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Core\ApiResponse;
use src\Models\postModel;
use src\Models\userModel;

class PostController {
    use ApiResponse;

    private $db;
    private $postModel;
    private $userModel;

    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->postModel = new postModel($this->db);
        $this->userModel = new userModel($this->db, $_SESSION['userId'] ?? null);
    }

    public function updatePost($request, $response, $args) {
        $userId = $_SESSION['userId'] ?? null;
        if (!$userId) {
            return $this->error($response, 'Unauthorized', 401);
        }

        $me = $this->userModel->getUserById($userId);
        if (!$me) return $this->error($response, 'Unauthorized', 401);

        $postId = $args['postId'];
        $clientId = $this->postModel->getClientId($postId);
        if (!$clientId) return $this->error($response, 'Post not found', 404);

        if ($me['role'] !== 'Admin' && (int) $clientId !== (int) $userId) {
            return $this->error($response, 'Forbidden', 403);
        }

        $data = $request->getParsedBody() ?? [];

        $allowedFields = ['jobTitle', 'jobDescription', 'budget', 'hourlyRate', 'jobType'];
        $updates = [];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowedFields)) {
                $updates[$key] = $value;
            }
        }

        if (empty($updates)) {
            return $this->error($response, 'No fields to update', 400);
        }
        if (isset($updates['jobType']) && !in_array($updates['jobType'], ['Fixed', 'Hourly'], true)) {
            return $this->error($response, 'Invalid job type', 400);
        }
        foreach (['budget', 'hourlyRate'] as $amountField) {
            if (isset($updates[$amountField]) && $updates[$amountField] !== null && !is_numeric($updates[$amountField])) {
                return $this->error($response, "$amountField must be numeric", 400);
            }
        }

        $this->postModel->editPost($postId, $updates);

        $response->getBody()->write(json_encode(['status' => 200, 'message' => 'Post updated successfully']));
        return $response->withStatus(200);
    }

    public function createPost($request, $response, $args) {
        $requestBody = $request->getParsedBody() ?? [];
        $userId = $_SESSION['userId'] ?? null;

        if(!$userId) {
            return $this->error($response, 'Unauthorized', 401);
        }

        $me = $this->userModel->getUserById($userId);
        if (!$me || $me['role'] === 'Freelancer') return $this->error($response, 'Unauthorized', 401);

        $validationError = $this->validatePostDetails($requestBody);
        if ($validationError) return $this->error($response, $validationError, 400);

        $uploadedFiles = $request->getUploadedFiles();
        $thumbnail     = $uploadedFiles['jobThumbnail'] ?? null;
        $allowedTypes  = ['image/jpeg', 'image/png'];
        $maxFileSize   = 2.5 * 1024 * 1024; // 2.5 MB

        if ($thumbnail && $thumbnail->getError() !== UPLOAD_ERR_NO_FILE) {
            if ($thumbnail->getError() !== UPLOAD_ERR_OK) {
                return $this->error($response, "File upload failed", 400);
            }
            if (!in_array($thumbnail->getClientMediaType(), $allowedTypes)) {
                return $this->error($response, "Invalid file type, only JPEG and PNG are allowed", 400);
            }
            if ($thumbnail->getSize() > $maxFileSize) {
                return $this->error($response, "File size exceeds the limit of 2.5MB", 400);
            }
        }

        $createdPostId = $this->postModel->createPost($userId, $requestBody);
        
        if ($thumbnail && $thumbnail->getError() === UPLOAD_ERR_OK) {
            $this->postModel->setThumbnailForPost($thumbnail, $createdPostId);
        }

        $response->getBody()->write(json_encode(['status'=> 201, 'message'=> 'Post Created Successfully', 'postId' => $createdPostId]));
        return $response->withStatus(201);
    }

    public function saveOrRemoveSavedPost($request, $response, $args) {
        $userId = $_SESSION['userId'] ?? null;
        if(!$userId) return $this->error($response, 'Unauthorized', 401);

        $postId = $args['postId'];
        if(!$postId) return $this->error($response, 'Post ID is required',400);

        $isPostSaved = $this->postModel->isPostSaved($userId, $postId);
        if($isPostSaved) $result = $this->postModel->removeSavedPost($userId, $postId);
        else $result = $this->postModel->savePost($userId, $postId);

        return $this->result($response, $result);
    }

    public function savePost($request, $response, $args) {
        $userId = $_SESSION['userId'] ?? null;
        if(!$userId) return $this->error($response, 'Unauthorized',401);
        
        $postId = $args['postId'];
        if(!$postId) return $this->error($response, 'Post ID is required',400);

        $this->postModel->savePost($userId, $postId);
        $response->getBody()->write(json_encode(['status'=> 200, 'message'=> 'Post Saved Successfully']));
        return $response->withStatus(200);
    }

    public function removeSavedPost($request, $response, $args) {
        $userId = $_SESSION['userId'] ?? null;
        if(!$userId) return $this->error($response, 'Unauthorized',401);
        
        $postId = $args['postId'];
        if(!$postId) return $this->error($response, 'Post ID is required',400);

        $this->postModel->removeSavedPost($userId, $postId);
        $response->getBody()->write(json_encode(['status'=> 200, 'message'=> 'Post Removed Successfully']));
        return $response->withStatus(200);
    }

    public function deletePost($request, $response, $args) {
        $userId = $_SESSION['userId'] ?? null;
        if(!$userId) return $this->error($response, 'Unauthorized',401);
        
        $postId = $args['postId'];
        if(!$postId) return $this->error($response, 'Post ID is required',400);

        $this->postModel->deletePostFromUser($userId, $postId);
        $response->getBody()->write(json_encode(['status'=> 200, 'message'=> 'Post Deleted Successfully']));
        return $response->withStatus(200);
    }
    private function validatePostDetails($data) {
        $requiredFields = ['title', 'description', 'paymentMethod', 'paymentAmount'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || trim((string) $data[$field]) === '') {
                return "$field is required";
            }
        }

        if (!in_array($data['paymentMethod'], ['Fixed', 'Hourly'], true)) {
            return 'Invalid payment method';
        }

        if (!is_numeric($data['paymentAmount']) || (float) $data['paymentAmount'] <= 0) {
            return 'Payment amount must be greater than zero';
        }

        return null;
    }
}
