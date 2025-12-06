<?php

namespace src\Controllers;
use PDO;
use Psr\Container\ContainerInterface;

class NotificationsController {
    private $db;
    public function __construct(ContainerInterface $container) {
        $this->db = $container->get('db');
    }

    // Get all notification's user from DB
    public function getallnotifications($request,$response){
        if(!isset($_SESSION['userId']))
            return $this->error($response,'unauthorized',401);
        
        $userId = $_SESSION['userId'];
        
        try {
            $stmt = $this->db->prepare("SELECT * FROM Notifications WHERE userId = :userId ORDER BY createdAt DESC");
            $stmt->execute(['userId' => $userId]);
            $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response->getBody()->write(json_encode($notifications));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            return $this->error($response, $e->getMessage(), 500);
        }
    }

    // Mark all notification as read
    public function markallread($request,$response){
        if(!isset($_SESSION['userId']))
            return $this->error($response,'unauthorized',401);
            
        $userId = $_SESSION['userId'];

        $stmt = $this->db->prepare("UPDATE Notifications SET isMarkedRead = 1 WHERE userId = :userId");
        $stmt->execute(['userId' => $userId]);

        $response->getBody()->write(json_encode(['success'=>true , 'message'=>'All notifications marked as read']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    // Mark a notification as read
    public function markread($request,$response){
        if(!isset($_SESSION['userId']))
            return $this->error($response,'unauthorized',401);

        $userId = $_SESSION['userId'];
        $data = $request->getParsedBody();
        $notificationId = $data['notificationId'] ?? null;

        if (!$notificationId) {
             return $this->error($response, 'Notification ID required', 400);
        }

        $stmt = $this->db->prepare("UPDATE Notifications SET isMarkedRead = 1 WHERE notificationId = :notificationId AND userId = :userId");
        $stmt->execute(['notificationId' => $notificationId, 'userId' => $userId]);

        if ($stmt->rowCount() === 0)
            return $this->error($response, 'Notification not found or already read', 404);

        $response->getBody()->write(json_encode(['success' => true, 'message' => 'Notification marked as read']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    // Delete a notification
    public function delete($request, $response, $args) {
        if (!isset($_SESSION['userId']))
            return $this->error($response, 'Unauthorized', 401);

        $userId = $_SESSION['userId'];
        $notificationId = $args['notificationId'] ?? null;
    
        if (!$notificationId) return $this->error($response, 'Notification ID required', 400);

        $stmt = $this->db->prepare("DELETE FROM Notifications WHERE notificationId = :notificationId AND userId = :userId");
        $stmt->execute(['notificationId' => $notificationId, 'userId' => $userId]);

        if ($stmt->rowCount() === 0) return $this->error($response, 'Notification not found', 404);

        $response->getBody()->write(json_encode(['success' => true, 'message' => 'Notification deleted']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    private function error($response, $message, $status) {
        $response->getBody()->write(json_encode(['error' => $message]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}
