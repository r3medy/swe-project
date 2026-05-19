<?php

namespace src\Controllers;

use Psr\Container\ContainerInterface;
use src\Core\ApiResponse;
use src\Models\notificationModel;

class NotificationsController {
    use ApiResponse;

    private $db;
    private $notificationModel;

    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
        $this->notificationModel = new notificationModel($this->db);
    }

    // Get all notifications
    public function getAllNotifications($request, $response) {
        if (!isset($_SESSION['userId'])) return $this->error($response,'Unauthorized',401);

        $query = $request->getQueryParams();
        $notifications = $this->notificationModel->getAll($_SESSION['userId'], $query['page'] ?? 1, $query['limit'] ?? 50);

        $response->getBody()->write(json_encode(['notifications' => $notifications]));
        return $response->withHeader('Content-Type','application/json')->withStatus(200);
    }

    // Mark all notifications as read
    public function markAllRead($request, $response) {
        if (!isset($_SESSION['userId'])) return $this->error($response,'Unauthorized',401);
        $updated = $this->notificationModel->markAllRead($_SESSION['userId']);
        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Marked all notifications as read',
            'updated' => $updated
        ]));
        return $response->withHeader('Content-Type','application/json')->withStatus(200);
    }

    // Delete a notification
    public function delete($request, $response, $args) {
        if (!isset($_SESSION['userId'])) return $this->error($response,'Unauthorized',401);
        $notificationId = $args['notificationId'] ?? null;
        if (!$notificationId) return $this->error($response,'Notification ID required',400);

        $deleted = $this->notificationModel->delete($notificationId, $_SESSION['userId']);
        if ($deleted === 0) return $this->error($response,'Notification not found',404);

        $response->getBody()->write(json_encode(['success' => true, 'message' => 'Notification deleted']));
        return $response->withHeader('Content-Type','application/json')->withStatus(200);
    }
}
