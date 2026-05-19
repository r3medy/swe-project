<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Core\ApiResponse;
use src\Models\chatModel;
use src\Models\notificationModel;
use src\Models\postModel;
use src\Models\proposalModel;
use src\Models\userModel;

class ProposalController {
    use ApiResponse;

    private $db;
    private $userModel;
    private $postModel;
    private $proposalModel;
    private $notificationModel;
    private $chatModel;

    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->userModel = new userModel($this->db, $_SESSION['userId'] ?? null);
        $this->postModel = new postModel($this->db);
        $this->proposalModel = new proposalModel($this->db);
        $this->notificationModel = new notificationModel($this->db);
        $this->chatModel = new chatModel($this->db);
    }

    public function createProposal($request, $response, $args) {
        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);

        $freelancerId = $_SESSION['userId'];
        $me = $this->userModel->getUserById($freelancerId);
        if (!$me || $me['role'] !== 'Freelancer') return $this->error($response, 'Forbidden', 403);

        $postId = $args['postId'] ?? null;
        $data = $request->getParsedBody() ?? [];
        $description = trim($data['description'] ?? '');

        if (!$postId || $description === '') return $this->error($response, 'Post ID and description required', 400);

        $post = $this->postModel->getPostById($postId);
        if (!$post) return $this->error($response, 'Post not found', 404);
        if ($post['status'] !== 'Accepted' || (int) $post['isJobAccepted'] === 1) {
            return $this->error($response, 'Post is not open for proposals', 400);
        }
        if ((int) $post['clientId'] === (int) $freelancerId) return $this->error($response, 'Forbidden', 403);
        if ($this->proposalModel->hasProposal($freelancerId, $postId)) {
            return $this->error($response, 'Proposal already submitted', 409);
        }

        $this->proposalModel->createProposal($freelancerId, $postId, $description);
        $this->notificationModel->addNotification($post['clientId'], "New proposal received for your post");

        $response->getBody()->write(json_encode(['success' => true, 'message' => 'Proposal submitted']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    public function getProposals($request, $response, $args) {
        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);

        $me = $this->userModel->getUserById($_SESSION['userId']);
        if (!$me || $me['role'] !== 'Client') return $this->error($response, 'Forbidden', 403);

        $postId = $args['postId'] ?? null;
        if (!$postId) return $this->error($response, 'Post ID required', 400);

        $clientId = $this->postModel->getClientId($postId);
        if (!$clientId) return $this->error($response, 'Post not found', 404);
        if ((int) $clientId !== (int) $_SESSION['userId']) return $this->error($response, 'Forbidden', 403);

        $proposals = $this->proposalModel->getProposalsByPost($postId);

        $response->getBody()->write(json_encode(['proposals' => $proposals]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function getProposalById($request, $response, $args) {
        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);

        $userId = $_SESSION['userId'];
        $me = $this->userModel->getUserById($userId);
        if (!$me) return $this->error($response, 'Unauthorized', 401);

        $proposalId = $args['proposalId'] ?? null;
        if (!$proposalId) return $this->error($response, 'Proposal ID is required', 400);

        $proposal = $this->proposalModel->getProposalsById($proposalId)[0] ?? null;
        if (!$proposal) return $this->error($response, 'Proposal not found', 404);

        $isAdmin = $me['role'] === 'Admin';
        $isClient = (int) $userId === (int) $proposal['clientId'];
        $isFreelancer = (int) $userId === (int) $proposal['freelancerId'];

        if (!$isAdmin && !$isClient && !$isFreelancer) {
            return $this->error($response, 'Forbidden: You do not have access to this proposal', 403);
        }

        $response->getBody()->write(json_encode(['proposal' => $proposal]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function updateProposal($request, $response, $args) {
        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);

        $proposalId = $args['proposalId'] ?? null;
        $data = $request->getParsedBody() ?? [];
        $description = trim($data['description'] ?? '');

        if (!$proposalId || $description === '') return $this->error($response, 'Proposal ID and description required', 400);

        $ownerId = $this->proposalModel->getProposalOwner($proposalId);
        if (!$ownerId) return $this->error($response, 'Proposal not found', 404);
        if ((int) $ownerId !== (int) $_SESSION['userId']) return $this->error($response, 'Forbidden: Not your proposal', 403);

        $this->proposalModel->updateProposal($proposalId, $description);

        $response->getBody()->write(json_encode(['success' => true, 'message' => 'Proposal updated']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function deleteProposal($request, $response, $args) {
        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);

        $userId = $_SESSION['userId'];
        $postId = $args['postId'] ?? null;
        $proposalId = $args['proposalId'] ?? null;

        if (!$postId || !$proposalId) return $this->error($response, 'Post ID and Proposal ID required', 400);

        $clientId = $this->postModel->getClientId($postId);
        $freelancerId = $this->proposalModel->getProposalOwner($proposalId);
        if (!$clientId || !$freelancerId) return $this->error($response, 'Proposal not found', 404);
        if ((int) $userId !== (int) $clientId && (int) $userId !== (int) $freelancerId) return $this->error($response, 'Forbidden', 403);

        $rowCount = $this->proposalModel->deleteProposal($proposalId, $postId);
        if ($rowCount === 0) return $this->error($response, 'Proposal not found', 404);

        $response->getBody()->write(json_encode(['success' => true, 'message' => 'Proposal deleted']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function declineProposal($request, $response, $args) {
        return $this->changeProposalStatus($response, $args, 'Refused');
    }

    public function acceptProposal($request, $response, $args) {
        return $this->changeProposalStatus($response, $args, 'Accepted');
    }

    private function changeProposalStatus($response, $args, $status) {
        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);

        $proposalId = $args['proposalId'] ?? null;
        $postId = $args['postId'] ?? null;
        if (!$proposalId || !$postId) return $this->error($response, 'Proposal ID and Post ID required', 400);

        $clientId = $this->postModel->getClientId($postId);
        if (!$clientId) return $this->error($response, 'Post not found', 404);
        if ((int) $clientId !== (int) $_SESSION['userId']) return $this->error($response, 'Forbidden: Not the post owner', 403);

        $proposal = $this->proposalModel->getProposalsById($proposalId)[0] ?? null;
        if (!$proposal || (int) $proposal['postId'] !== (int) $postId) {
            return $this->error($response, 'Proposal not found', 404);
        }

        if ($proposal['status'] === $status) {
            $response->getBody()->write(json_encode(['success' => true, 'message' => "Proposal $status"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }

        $rowCount = $this->proposalModel->changeStatus($proposalId, $postId, $status);
        if ($rowCount === 0) return $this->error($response, 'Proposal not found', 404);

        if ($status === 'Accepted') {
            $this->postModel->markJobAccepted($postId);
            $this->chatModel->newChat($postId, $proposal['freelancerId'], $clientId);
        }

        $response->getBody()->write(json_encode(['success' => true, 'message' => "Proposal $status"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
}
