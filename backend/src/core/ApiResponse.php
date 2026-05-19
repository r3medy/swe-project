<?php

namespace src\Core;

use Psr\Http\Message\ResponseInterface;

trait ApiResponse
{
    protected function success(ResponseInterface $response, mixed $data = null, int $status = 200): ResponseInterface
    {
        $body = ['success' => true];
        if ($data !== null) {
            $body['data'] = $data;
        }

        $response->getBody()->write(json_encode($body));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    protected function error(ResponseInterface $response, string $message, int $status = 400): ResponseInterface
    {
        $response->getBody()->write(json_encode([
            'error' => ['code' => $status, 'message' => $message],
        ]));

        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    protected function result(ResponseInterface $response, array $result): ResponseInterface
    {
        $status = (int) ($result['status'] ?? 200);
        if ($status >= 400) {
            $body = [
                'error' => [
                    'code' => $status,
                    'message' => (string) ($result['message'] ?? 'Request failed'),
                ],
            ];
            if (isset($result['errors'])) {
                $body['data'] = $result['errors'];
            }

            $response->getBody()->write(json_encode($body));
            return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
        }

        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}
