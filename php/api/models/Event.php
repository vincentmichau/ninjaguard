&lt;?php
/**
 * NightWatch - Modèle Événement
 */

require_once __DIR__ . '/../../database/Database.php';

class Event {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Créer un nouvel événement
     */
    public function create($data) {
        $sql = "INSERT INTO events 
                (report_id, type, title, description, severity, occurred_at, resolved_at, is_resolved) 
                VALUES 
                (:report_id, :type, :title, :description, :severity, :occurred_at, :resolved_at, :is_resolved)";
        
        $params = [
            ':report_id' => $data['report_id'],
            ':type' => $data['type'],
            ':title' => $data['title'],
            ':description' => $data['description'] ?? null,
            ':severity' => $data['severity'] ?? 'moyen',
            ':occurred_at' => $data['occurred_at'],
            ':resolved_at' => $data['resolved_at'] ?? null,
            ':is_resolved' => $data['is_resolved'] ?? 0
        ];
        
        return $this->db->query($sql, $params);
    }

    /**
     * Obtenir un événement par ID
     */
    public function getById($id) {
        $sql = "SELECT * FROM events WHERE id = :id";
        return $this->db->fetchOne($sql, [':id' => $id]);
    }

    /**
     * Obtenir tous les événements d'un rapport
     */
    public function getByReport($reportId) {
        $sql = "SELECT * FROM events WHERE report_id = :report_id ORDER BY occurred_at DESC";
        return $this->db->fetchAll($sql, [':report_id' => $reportId]);
    }

    /**
     * Mettre à jour un événement
     */
    public function update($id, $data) {
        $fields = [];
        $params = [':id' => $id];
        
        $allowedFields = ['type', 'title', 'description', 'severity', 'occurred_at', 'resolved_at', 'is_resolved'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }
        
        if (!empty($fields)) {
            $sql = "UPDATE events SET " . implode(', ', $fields) . " WHERE id = :id";
            return $this->db->query($sql, $params);
        }
        
        return false;
    }

    /**
     * Supprimer un événement
     */
    public function delete($id) {
        $sql = "DELETE FROM events WHERE id = :id";
        return $this->db->query($sql, [':id' => $id]);
    }
}