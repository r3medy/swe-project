<?php

namespace src\Controllers;

use src\Models\userModel;
use src\Models\postModel;
use src\Models\proposalModel;
use src\Models\notificationModel;
use src\Models\chatModel;
use Psr\Container\ContainerInterface;

class ProposalController {
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

    // creat proposal br freelancer
    public function createProposal($request, $response, $args) {
        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);

        $me = $this->userModel->getUserById($_SESSION['userId']);
        if ($me['role'] !== 'Freelancer') return $this->error($response, 'Forbidden', 403);

        $freelancerId = $_SESSION['userId'];
        $postId = $args['postId'] ?? null;
        $data = $request->getParsedBody(); // expected=> ['description']

        if (!$postId || empty($data['description'])) return $this->error($response, 'Post ID and description required', 400);

        $this->proposalModel->createProposal($freelancerId, $postId, $data['description']);

        $clientId = $this->postModel->getClientId($postId);
        $this->notificationModel->addNotification($clientId, "New proposal received for your post");

        // $this->proposalModel->createChat($freelancerId, $postId);
        $response->getBody()->write(json_encode(['success' => true, 'message' => 'Proposal submitted']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    // Get all proposals for a post
    public function getProposals($request, $response, $args) {
        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);

        $me = $this->userModel->getUserById($_SESSION['userId']);
        if ($me['role'] !== 'Client') return $this->error($response, 'Forbidden', 403);

        $postId = $args['postId'] ?? null;
        if (!$postId) return $this->error($response, 'Post ID required', 400);

        $clientId = $this->postModel->getClientId($postId);

        if ($clientId != $_SESSION['userId']) return $this->error($response, 'Forbidden', 403);
        
        $proposals = $this->proposalModel->getProposalsByPost($postId);

        $response->getBody()->write(json_encode(['proposals' => $proposals]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
    public function declineProposal($request, $response, $args) {
        return $this->changeProposalStatus($request, $response, $args, 'Refused');
    }

    public function acceptProposal($request, $response, $args) {
        return $this->changeProposalStatus($request, $response, $args, 'Accepted');
    }
    // Get proposal by ID
   public function getProposalById($request, $response, $args) {
    if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
    $userId = $_SESSION['userId'];
    $proposalId = $args['proposalId'] ?? null;
    if (!$proposalId) {
        return $this->error($response, 'Proposal ID is required', 400);
    }
    
    $proposals = $this->proposalModel->getProposalsById($proposalId);
    $proposal = $proposals[0] ?? null;

    if (!$proposal) {
        return $this->error($response, 'Proposal not found', 404);
    }
    //should who is can get proposal id ===>
    // (admin,client who is creat the post, freelancer who is creat the proposal)
    $clientId = $proposal['clientId'];
    if ($userId != $proposal['freelancerId'] && $userId != $clientId && $_SESSION['role'] != 'Admin') {
        return $this->error($response, 'Forbidden: You do not have access to this proposal', 403);
    }
    $response->getBody()->write(json_encode(['proposal' => $proposal]));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
}
    // Update a proposal
    public function updateProposal($request, $response, $args) {
        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);

        $proposalId = $args['proposalId'] ?? null;
        $data = $request->getParsedBody(); // expected: ['description']

        if (!$proposalId || empty($data['description'])) return $this->error($response, 'Proposal ID and description required', 400);
        
        //check who is update is the freelancer who created the proposal
        $ownerId = $this->proposalModel->getProposalOwner($proposalId);
        if ($ownerId != $_SESSION['userId']) return $this->error($response, 'Forbidden: Not your proposal', 403);

        $this->proposalModel->updateProposal($proposalId, $data['description']);

        $response->getBody()->write(json_encode(['success' => true, 'message' => 'Proposal updated']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
    // DELETE proposal
    public function deleteProposal($request, $response, $args) {
    if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);

    $userId = $_SESSION['userId'];
    $postId = $args['postId'] ?? null;
    $proposalId = $args['proposalId'] ?? null;

    if (!$postId || !$proposalId) return $this->error($response, 'Post ID and Proposal ID required', 400);

    // Get post owner
    $clientId = $this->postModel->getClientId($postId);
    // Get proposal owner
    $freelancerId = $this->proposalModel->getProposalOwner($proposalId);
    
    // Authorization check
    if ($userId != $clientId && $userId != $freelancerId) return $this->error($response, 'Forbidden', 403);
    
    $rowCount = $this->proposalModel->deleteProposal($proposalId, $postId);

    if ($rowCount === 0) {
        return $this->error($response, 'Proposal not found', 404);
    }

    $response->getBody()->write(json_encode([
        'success' => true,
        'message' => 'Proposal deleted'
    ]));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
}
    // Function change status
    private function changeProposalStatus($request, $response, $args, $status) {
        $proposalId = $args['proposalId'] ?? null;
        $postId = $args['postId'] ?? null;

        if (!isset($_SESSION['userId'])) return $this->error($response, 'Unauthorized', 401);
        if (!$proposalId || !$postId) return $this->error($response, 'Proposal ID and Post ID required', 400);

        //check post owner
        $clientId = $this->postModel->getClientId($postId);

        if ($clientId != $_SESSION['userId']) return $this->error($response, 'Forbidden: Not the post owner', 403);

        $rowCount = $this->proposalModel->changeStatus($proposalId, $postId, $status);

        if ($status === 'Accepted') {
            $this->postModel->markJobAccepted($postId);

            $freelancerId = $this->proposalModel->getProposalOwner($proposalId);

            $this->chatModel->newChat($postId, $freelancerId, $clientId);
        }

        if ($rowCount === 0) return $this->error($response, 'Proposal not found', 404);

        $response->getBody()->write(json_encode(['success' => true, 'message' => "Proposal $status"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
    // Private: send error response
    private function error($response, $message, $status) {
        $response->getBody()->write(json_encode(['error' => $message]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}
