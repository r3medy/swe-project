<?php
namespace src\Models;

use PDO;

class ProposalModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // CREATE proposal
    public function createProposal($freelancerId, $postId, $description) {
        $stmt = $this->db->prepare("
            INSERT INTO proposals (freelancerId, postId, description, status)
            VALUES (:freelancerId, :postId, :description, 'Pending')
        ");

        return $stmt->execute([
            ':freelancerId' => $freelancerId,
            ':postId'       => $postId,
            ':description'  => $description
        ]);
    }

    // GET proposals for post
    public function getProposalsByPost($postId) {
        $stmt = $this->db->prepare("
            SELECT 
                proposals.proposalId,
                proposals.freelancerId,
                proposals.postId,
                proposals.description,
                proposals.status,
                proposals.submittedAt,
                users.firstName,
                users.lastName,
                users.profilePicture,
                users.username,
                users.gender
            FROM proposals
            JOIN users ON proposals.freelancerId = users.userId
            WHERE proposals.postId = :postId
            ORDER BY proposals.submittedAt DESC
        ");

        $stmt->execute([':postId' => $postId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // GET proposal by ID
    public function getProposalsById($proposalId) {
        $stmt = $this->db->prepare("
            SELECT 
                proposals.*,
                posts.clientId,
                users.role AS freelancerRole
            FROM proposals
            JOIN posts ON proposals.postId = posts.postId
            JOIN users ON proposals.freelancerId = users.userId
            WHERE proposals.proposalId = :proposalId
        ");

        $stmt->execute([':proposalId' => $proposalId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // UPDATE proposal
    public function updateProposal($proposalId, $description) {
        $stmt = $this->db->prepare("
            UPDATE proposals
            SET description = :description
            WHERE proposalId = :proposalId
        ");

        return $stmt->execute([
            ':description' => $description,
            ':proposalId'  => $proposalId
        ]);
    }

    // DELETE proposal
    public function deleteProposal($proposalId, $postId) {
        $stmt = $this->db->prepare("
            DELETE FROM proposals
            WHERE proposalId = :proposalId AND postId = :postId
        ");

        $stmt->execute([
            ':proposalId' => $proposalId,
            ':postId'     => $postId
        ]);

        return $stmt->rowCount();
    }

    // CHANGE status (accepted/declined)
    public function changeStatus($proposalId, $postId, $status) {
        $stmt = $this->db->prepare("
            UPDATE proposals
            SET status = :status
            WHERE proposalId = :proposalId AND postId = :postId
        ");

        $stmt->execute([
            ':status'      => $status,
            ':proposalId'  => $proposalId,
            ':postId'      => $postId
        ]);

        return $stmt->rowCount();
    }

    // GET owner id (client & freelancer id) {authorization check}
    public function getPostOwner($postId) {
        $stmt = $this->db->prepare("
            SELECT clientId FROM posts WHERE postId = :postId
        ");

        $stmt->execute([':postId' => $postId]);
        return $stmt->fetchColumn();
    }

    public function getProposalOwner($proposalId) {
        $stmt = $this->db->prepare("
            SELECT freelancerId FROM proposals WHERE proposalId = :proposalId
        ");

        $stmt->execute([':proposalId' => $proposalId]);
        return $stmt->fetchColumn();
    }
}
