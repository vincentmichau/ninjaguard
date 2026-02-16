&lt;?php
/**
 * NightWatch - Modèle Rapport
 */

require_once __DIR__ . '/../../database/Database.php';

class Report {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Créer un nouveau rapport
     */
    public function create($data) {
        $sql = "INSERT INTO reports 
                (user_id, site_id, report_date, shift_type, start_time, end_time, 
                 weather, temperature, general_status, general_notes, photos) 
                VALUES 
                (:user_id, :site_id, :report_date, :shift_type, :start_time, :end_time, 
                 :weather, :temperature, :general_status, :general_notes, :photos)";
        
        $params = [
            ':user_id' => $data['user_id'],
            ':site_id' => $data['site_id'],
            ':report_date' => $data['report_date'],
            ':shift_type' => $data['shift_type'],
            ':start_time' => $data['start_time'],
            ':end_time' => $data['end_time'] ?? null,
            ':weather' => $data['weather'] ?? null,
            ':temperature' => $data['temperature'] ?? null,
            ':general_status' => $data['general_status'] ?? 'normal',
            ':general_notes' => $data['general_notes'] ?? null,
            ':photos' => isset($data['photos']) ? json_encode($data['photos']) : null
        ];
        
        return $this->db->query($sql, $params);
    }

    /**
     * Obtenir un rapport par ID avec toutes les relations
     */
    public function getById($id) {
        $sql = "SELECT r.*, 
                       u.first_name, u.last_name, u.email,
                       s.name as site_name, s.address as site_address, s.city as site_city,
                       c.name as client_name,
                       v.first_name as validator_first_name, v.last_name as validator_last_name
                FROM reports r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN sites s ON r.site_id = s.id
                LEFT JOIN clients c ON s.client_id = c.id
                LEFT JOIN users v ON r.validated_by = v.id
                WHERE r.id = :id";
        
        $report = $this->db->fetchOne($sql, [':id' => $id]);
        
        if ($report) {
            $report['events'] = $this->getEvents($id);
            if ($report['photos']) {
                $report['photos'] = json_decode($report['photos'], true);
            }
        }
        
        return $report;
    }

    /**
     * Obtenir tous les rapports avec pagination
     */
    public function getAll($page = 1, $limit = 20, $filters = []) {
        $offset = ($page - 1) * $limit;
        
        $where = ['1=1'];
        $params = [];
        
        if (!empty($filters['user_id'])) {
            $where[] = "r.user_id = :user_id";
            $params[':user_id'] = $filters['user_id'];
        }
        
        if (!empty($filters['site_id'])) {
            $where[] = "r.site_id = :site_id";
            $params[':site_id'] = $filters['site_id'];
        }
        
        if (!empty($filters['status'])) {
            $where[] = "r.general_status = :status";
            $params[':status'] = $filters['status'];
        }
        
        if (!empty($filters['validated'])) {
            $where[] = "r.is_validated = :validated";
            $params[':validated'] = $filters['validated'];
        }
        
        if (!empty($filters['date_from'])) {
            $where[] = "r.report_date >= :date_from";
            $params[':date_from'] = $filters['date_from'];
        }
        
        if (!empty($filters['date_to'])) {
            $where[] = "r.report_date <= :date_to";
            $params[':date_to'] = $filters['date_to'];
        }
        
        $whereClause = implode(' AND ', $where);
        
        $sql = "SELECT r.*, 
                       u.first_name, u.last_name, 
                       s.name as site_name,
                       c.name as client_name
                FROM reports r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN sites s ON r.site_id = s.id
                LEFT JOIN clients c ON s.client_id = c.id
                WHERE $whereClause
                ORDER BY r.created_at DESC 
                LIMIT :limit OFFSET :offset";
        
        $params[':limit'] = $limit;
        $params[':offset'] = $offset;
        
        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Mettre à jour un rapport
     */
    public function update($id, $data) {
        $fields = [];
        $params = [':id' => $id];
        
        $allowedFields = ['site_id', 'report_date', 'shift_type', 'start_time', 'end_time', 
                          'weather', 'temperature', 'general_status', 'general_notes'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }
        
        if (isset($data['photos'])) {
            $fields[] = "photos = :photos";
            $params[':photos'] = json_encode($data['photos']);
        }
        
        if (!empty($fields)) {
            $sql = "UPDATE reports SET " . implode(', ', $fields) . " WHERE id = :id";
            return $this->db->query($sql, $params);
        }
        
        return false;
    }

    /**
     * Valider un rapport
     */
    public function validate($id, $validatorId) {
        $sql = "UPDATE reports 
                SET is_validated = 1, validated_by = :validator_id, validated_at = NOW() 
                WHERE id = :id";
        return $this->db->query($sql, [
            ':validator_id' => $validatorId,
            ':id' => $id
        ]);
    }

    /**
     * Supprimer un rapport
     */
    public function delete($id) {
        $sql = "DELETE FROM reports WHERE id = :id";
        return $this->db->query($sql, [':id' => $id]);
    }

    /**
     * Obtenir les événements d'un rapport
     */
    public function getEvents($reportId) {
        $sql = "SELECT * FROM events WHERE report_id = :report_id ORDER BY occurred_at DESC";
        return $this->db->fetchAll($sql, [':report_id' => $reportId]);
    }

    /**
     * Compter le nombre total de rapports
     */
    public function count($filters = []) {
        $where = ['1=1'];
        $params = [];
        
        foreach ($filters as $key => $value) {
            $where[] = "$key = :$key";
            $params[":$key"] = $value;
        }
        
        $whereClause = implode(' AND ', $where);
        $sql = "SELECT COUNT(*) as total FROM reports WHERE $whereClause";
        $result = $this->db->fetchOne($sql, $params);
        return $result['total'];
    }

    /**
     * Obtenir les statistiques
     */
    public function getStats($userId = null) {
        $where = $userId ? "WHERE user_id = :user_id" : "";
        $params = $userId ? [':user_id' => $userId] : [];
        
        $sql = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN is_validated = 1 THEN 1 ELSE 0 END) as validated,
                    SUM(CASE WHEN general_status = 'incident' THEN 1 ELSE 0 END) as incidents,
                    SUM(CASE WHEN general_status = 'alerte' THEN 1 ELSE 0 END) as alerts
                FROM reports $where";
        
        return $this->db->fetchOne($sql, $params);
    }

    /**
     * Obtenir les rapports récents
     */
    public function getRecent($limit = 5, $userId = null) {
        $where = $userId ? "WHERE r.user_id = :user_id" : "";
        $params = $userId ? [':user_id' => $userId] : [];
        
        $sql = "SELECT r.*, 
                       u.first_name, u.last_name, 
                       s.name as site_name
                FROM reports r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN sites s ON r.site_id = s.id
                $where
                ORDER BY r.created_at DESC 
                LIMIT :limit";
        
        $params[':limit'] = $limit;
        return $this->db->fetchAll($sql, $params);
    }
}