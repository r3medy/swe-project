<?php

namespace src\Controllers;

use PDO;
use Psr\Container\ContainerInterface;

class ProposalController
{
    private $db;
    public function __construct(ContainerInterface $container)
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
