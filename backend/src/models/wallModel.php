<?php
namespace src\Models;

use PDO;

class WallModel
{
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    //-----------------------------
    // Get posts based on filters
    //-----------------------------
    public function getPostsByFilter($filters) {
        $query = "SELECT p.*, u.firstName, u.lastName, u.profilePicture, u.gender,
                         GROUP_CONCAT(DISTINCT CONCAT(t.tagId, ':', t.tagName) SEPARATOR ',') as tagList,
                         (SELECT COUNT(*) FROM proposals pr WHERE pr.postId = p.postId) as proposalCount
                  FROM posts p
                  LEFT JOIN posttags pt ON p.postId = pt.postId
                  LEFT JOIN tags t ON pt.tagId = t.tagId
                  LEFT JOIN users u ON p.clientId = u.userId 
                  WHERE p.status = 'Accepted'";
        $params = [];

        // Filter by tags
        if (!empty($filters['tags']) && is_array($filters['tags'])) {
            $placeholders = implode(',', array_fill(0, count($filters['tags']), '?'));
            $query .= " AND p.postId IN (
                SELECT pt2.postId FROM posttags pt2 WHERE pt2.tagId IN ($placeholders)
            )";
            $params = array_merge($params, $filters['tags']);
        }

        // Filter by client name
        if (!empty($filters['clientName'])) {
            $query .= " AND p.clientId IN (
                           SELECT userId FROM users WHERE CONCAT(firstName,' ',lastName) LIKE ?
                       )";
            $params[] = "%" . $filters['clientName'] . "%";
        }

        $query .= " GROUP BY p.postId";

        $sortClause = $this->getSortClause($filters['sortBy'] ?? null);
        $query .= " " . $sortClause;

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);

        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($posts as &$post) {
            $post['tags'] = [];
            if (!empty($post['tagList'])) {
                $tagPairs = explode(',', $post['tagList']);
                foreach ($tagPairs as $pair) {
                    $parts = explode(':', $pair);
                    if (count($parts) === 2) {
                        $post['tags'][] = [
                            'tagId' => (int) $parts[0],
                            'tagName' => $parts[1]
                        ];
                    }
                }
            }
            unset($post['tagList']);
        }

        return $posts;
    }

    private function getSortClause($sortby) {
        switch($sortby) {
                case 'Newest':
                    $sortClause = "ORDER BY p.createdAt DESC";
                    break;
                case 'Oldest':
                    $sortClause = "ORDER BY p.createdAt ASC";
                    break;
                case 'Cheapest':
                    $sortClause = "ORDER BY COALESCE(p.budget, p.hourlyRate) ASC";
                    break;
                case 'Expensive':
                    $sortClause = "ORDER BY COALESCE(p.budget, p.hourlyRate) DESC";
                    break;
                default:
                    $sortClause = "ORDER BY p.createdAt DESC";
                    break;
            }
            return $sortClause;
    }
}
