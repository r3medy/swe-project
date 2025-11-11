<?php
namespace src\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ExampleController {
    public static function GET(Request $request, Response $response, array $args): Response {
        $response->getBody()->write("ExampleController GET method called");
        return $response;
    }
}
