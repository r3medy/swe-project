<?php

namespace src\Controllers;

use PDO;

class ProposalController
{
    private $db;
    public function __construct($container)
    {
        $this->db = $container->get('db');
    }

    public function createProposal($request, $response)
    {

    }

    public function getProposals($request, $response)
    {

    }

    public function declineProposal($request, $response)
    {

    }

    public function acceptProposal($request, $response)
    {

    }
    public function getProposalById($request, $response)
    {

    }

    public function updateProposal($request, $response)
    {

    }
}
