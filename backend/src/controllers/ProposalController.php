<?php

namespace src\Controllers;

use PDO;
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

        $stmt = $this->db->prepare("SELECT clientId FROM Posts WHERE postId = :postId");
        $stmt->execute([':postId' => $postId]);
        $clientId = $stmt->fetchColumn();

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
    $stmt = $this->db->prepare("
        SELECT 
            Proposals.proposalId,
            Proposals.freelancerId,
            Proposals.postId,
            Proposals.description,
            Proposals.status,
            Proposals.submittedAt,
            Posts.clientId,
            Users.role AS freelancerRole
        FROM Proposals
        JOIN Posts ON Proposals.postId = Posts.postId
        JOIN Users ON Proposals.freelancerId = Users.userId
        WHERE Proposals.proposalId = :proposalId
    ");
    $stmt->execute(['proposalId' => $proposalId]);
    $proposal = $stmt->fetch(PDO::FETCH_ASSOC);

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
        //check who is upadte is the freelancer who is create the proposal
        $stmt = $this->db->prepare("SELECT freelancerId FROM Proposals WHERE proposalId = :proposalId");
        $stmt->execute([':proposalId' => $proposalId]);
        $ownerId = $stmt->fetchColumn();
        if ($ownerId != $_SESSION['userId']) return $this->error($response, 'Forbidden: Not your proposal', 403);

        $stmt = $this->db->prepare("UPDATE Proposals SET description = :description WHERE proposalId = :proposalId");
        $stmt->execute([
            ':description' => $data['description'],
            ':proposalId' => $proposalId
        ]);

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

    // TODO: use the proposalModel
    // Bring post owner
    $stmt = $this->db->prepare("SELECT clientId FROM Posts WHERE postId = :postId");
    $stmt->execute([':postId' => $postId]);
    $clientId = $stmt->fetchColumn();
   // Bring proposal owner
    $stmt = $this->db->prepare("SELECT freelancerId FROM Proposals WHERE proposalId = :proposalId");
    $stmt->execute([':proposalId' => $proposalId]);
    $freelancerId = $stmt->fetchColumn();
    // Checking
    if ($userId != $clientId && $userId != $freelancerId) return $this->error($response, 'Forbidden', 403);
    $stmt = $this->db->prepare("DELETE FROM Proposals WHERE proposalId = :proposalId AND postId = :postId");
    $stmt->execute([
        ':proposalId' => $proposalId,
        ':postId' => $postId
    ]);

    if ($stmt->rowCount() === 0) {
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
        $stmt = $this->db->prepare("SELECT clientId FROM Posts WHERE postId = :postId");
        $stmt->execute([':postId' => $postId]);
        $clientId = $stmt->fetchColumn();

        if ($clientId != $_SESSION['userId']) return $this->error($response, 'Forbidden: Not the post owner', 403);

        // TODO: use the proposalModel
        $stmt = $this->db->prepare("UPDATE proposals SET status = :status WHERE proposalId = :proposalId AND postId = :postId");
        $stmt->execute([
            ':status' => $status,
            ':proposalId' => $proposalId,
            ':postId' => $postId
        ]);

        if ($status === 'Accepted') {
            $updatePostAcceptance = $this->db->prepare("UPDATE posts SET isJobAccepted = 1 WHERE postId = :postId");
            $updatePostAcceptance->execute([':postId' => $postId]);

            $proposalStmt = $this->db->prepare("SELECT freelancerId FROM proposals WHERE proposalId = :proposalId");
            $proposalStmt->execute([':proposalId' => $proposalId]);
            $freelancerId = $proposalStmt->fetchColumn();

            $this->chatModel->newChat($postId, $freelancerId, $clientId);
        }

        if ($stmt->rowCount() === 0) return $this->error($response, 'Proposal not found', 404);

        $response->getBody()->write(json_encode(['success' => true, 'message' => "Proposal $status"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
    // Private: send error response
    private function error($response, $message, $status) {
        $response->getBody()->write(json_encode(['error' => $message]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}
