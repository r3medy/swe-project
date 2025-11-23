<?php

namespace src\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;
use PDO;

class ProposalController {
    private $db;
    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
    }

    public function createProposal(Request $request, Response $response) {
        
    }

    public function getProposals(Request $request, Response $response) {
        
    }
    
    public function declineProposal(Request $request, Response $response) {
        
    }

    public function acceptProposal(Request $request, Response $response) {
        
    }
    public function getProposalById(Request $request, Response $response) {
        
    }

    public function updateProposal(Request $request, Response $response) {
        
    }
}
