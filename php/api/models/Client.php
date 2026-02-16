&lt;?php
/**
 * NightWatch - Modèle Client
 */

require_once __DIR__ . '/../../database/Database.php';

class Client {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Créer un nouveau client
     */
    public function create($data) {
        $sql = "INSERT INTO clients 
                (name, address, contact_person, contact_email, contact_phone) 
                VALUES 
                (:name, :address, :contact_person, :contact_email, :contact_phone)";
        
        $params = [
            ':name' => $data['name'],
            ':address' => $data['address'] ?? null,
            ':contact_person' => $data['contact_person'] ?? null,
            ':contact_email' => $data['contact_email'] ?? null,
            ':contact_phone' => $data['contact_phone'] ?? null
        ];
        
        return $this->db->query($sql, $params);
    }

    /**
     * Obtenir un client par ID
     */
    public function getById($id) {
        $sql = "SELECT * FROM clients WHERE id = :id";
        return $this->db->fetchOne($sql, [':id' => $id]);
    }

    /**
     * Obtenir tous les clients
     */
    public function getAll() {
        $sql = "SELECT * FROM clients ORDER BY name ASC";
        return $this->db->fetchAll($sql);
    }

    /**
     * Mettre à jour un client
     */
    public function update($id, $data) {
        $fields = [];
        $params = [':id' => $id];
        
        $allowedFields = ['name', 'address', 'contact_person', 'contact_email', 'contact_phone'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }
        
        if (!empty($fields)) {
            $sql = "UPDATE clients SET " . implode(', ', $fields) . " WHERE id = :id";
            return $this->db->query($sql, $params);
        }
        
        return false;
    }

    /**
     * Supprimer un client
     */
    public function delete($id) {
        $sql = "DELETE FROM clients WHERE id = :id";
        return $this->db->query($sql, [':id' => $id]);
    }

    /**
     * Compter le nombre total de clients
     */
    public function count() {
        $sql = "SELECT COUNT(*) as total FROM clients";
        $result = $this->db->fetchOne($sql);
        return $result['total'];
    }
}