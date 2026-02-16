&lt;?php
/**
 * NightWatch - Modèle Site
 */

require_once __DIR__ . '/../../database/Database.php';

class Site {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Créer un nouveau site
     */
    public function create($data) {
        $sql = "INSERT INTO sites 
                (client_id, name, address, city, postal_code, country, 
                 latitude, longitude, special_instructions, is_active) 
                VALUES 
                (:client_id, :name, :address, :city, :postal_code, :country, 
                 :latitude, :longitude, :special_instructions, :is_active)";
        
        $params = [
            ':client_id' => $data['client_id'],
            ':name' => $data['name'],
            ':address' => $data['address'],
            ':city' => $data['city'] ?? null,
            ':postal_code' => $data['postal_code'] ?? null,
            ':country' => $data['country'] ?? 'France',
            ':latitude' => $data['latitude'] ?? null,
            ':longitude' => $data['longitude'] ?? null,
            ':special_instructions' => $data['special_instructions'] ?? null,
            ':is_active' => $data['is_active'] ?? 1
        ];
        
        return $this->db->query($sql, $params);
    }

    /**
     * Obtenir un site par ID
     */
    public function getById($id) {
        $sql = "SELECT s.*, c.name as client_name 
                FROM sites s
                LEFT JOIN clients c ON s.client_id = c.id
                WHERE s.id = :id";
        return $this->db->fetchOne($sql, [':id' => $id]);
    }

    /**
     * Obtenir tous les sites
     */
    public function getAll($activeOnly = false) {
        $sql = "SELECT s.*, c.name as client_name 
                FROM sites s
                LEFT JOIN clients c ON s.client_id = c.id";
        
        if ($activeOnly) {
            $sql .= " WHERE s.is_active = 1";
        }
        
        $sql .= " ORDER BY s.name ASC";
        
        return $this->db->fetchAll($sql);
    }

    /**
     * Obtenir les sites par client
     */
    public function getByClient($clientId) {
        $sql = "SELECT * FROM sites WHERE client_id = :client_id ORDER BY name ASC";
        return $this->db->fetchAll($sql, [':client_id' => $clientId]);
    }

    /**
     * Mettre à jour un site
     */
    public function update($id, $data) {
        $fields = [];
        $params = [':id' => $id];
        
        $allowedFields = ['client_id', 'name', 'address', 'city', 'postal_code', 'country', 
                          'latitude', 'longitude', 'special_instructions', 'is_active'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }
        
        if (!empty($fields)) {
            $sql = "UPDATE sites SET " . implode(', ', $fields) . " WHERE id = :id";
            return $this->db->query($sql, $params);
        }
        
        return false;
    }

    /**
     * Supprimer un site
     */
    public function delete($id) {
        $sql = "DELETE FROM sites WHERE id = :id";
        return $this->db->query($sql, [':id' => $id]);
    }

    /**
     * Compter le nombre total de sites
     */
    public function count($activeOnly = true) {
        $sql = $activeOnly 
            ? "SELECT COUNT(*) as total FROM sites WHERE is_active = 1"
            : "SELECT COUNT(*) as total FROM sites";
        
        $result = $this->db->fetchOne($sql);
        return $result['total'];
    }
}