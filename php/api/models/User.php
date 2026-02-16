&lt;?php
/**
 * NightWatch - Modèle Utilisateur
 */

require_once __DIR__ . '/../../database/Database.php';

class User {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Créer un nouvel utilisateur
     */
    public function create($data) {
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO users (email, password, first_name, last_name, role, phone) 
                VALUES (:email, :password, :first_name, :last_name, :role, :phone)";
        
        $params = [
            ':email' => $data['email'],
            ':password' => $hashedPassword,
            ':first_name' => $data['first_name'],
            ':last_name' => $data['last_name'],
            ':role' => $data['role'] ?? 'watcher',
            ':phone' => $data['phone'] ?? null
        ];
        
        return $this->db->query($sql, $params);
    }

    /**
     * Authentifier un utilisateur
     */
    public function authenticate($email, $password) {
        $sql = "SELECT * FROM users WHERE email = :email AND is_active = 1";
        $user = $this->db->fetchOne($sql, [':email' => $email]);
        
        if ($user && password_verify($password, $user['password'])) {
            unset($user['password']);
            return $user;
        }
        
        return null;
    }

    /**
     * Obtenir un utilisateur par ID
     */
    public function getById($id) {
        $sql = "SELECT id, email, first_name, last_name, role, avatar, phone, is_active, created_at 
                FROM users WHERE id = :id";
        return $this->db->fetchOne($sql, [':id' => $id]);
    }

    /**
     * Obtenir tous les utilisateurs
     */
    public function getAll($page = 1, $limit = 20) {
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT id, email, first_name, last_name, role, avatar, phone, is_active, created_at 
                FROM users 
                ORDER BY created_at DESC 
                LIMIT :limit OFFSET :offset";
        
        return $this->db->fetchAll($sql, [
            ':limit' => $limit,
            ':offset' => $offset
        ]);
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function update($id, $data) {
        $fields = [];
        $params = [':id' => $id];
        
        $allowedFields = ['email', 'first_name', 'last_name', 'role', 'phone', 'avatar', 'is_active'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }
        
        if (!empty($fields)) {
            $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
            return $this->db->query($sql, $params);
        }
        
        return false;
    }

    /**
     * Changer le mot de passe
     */
    public function changePassword($id, $newPassword) {
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        $sql = "UPDATE users SET password = :password WHERE id = :id";
        return $this->db->query($sql, [
            ':password' => $hashedPassword,
            ':id' => $id
        ]);
    }

    /**
     * Supprimer un utilisateur
     */
    public function delete($id) {
        $sql = "DELETE FROM users WHERE id = :id";
        return $this->db->query($sql, [':id' => $id]);
    }

    /**
     * Compter le nombre total d'utilisateurs
     */
    public function count() {
        $sql = "SELECT COUNT(*) as total FROM users";
        $result = $this->db->fetchOne($sql);
        return $result['total'];
    }

    /**
     * Obtenir les statistiques par rôle
     */
    public function getStatsByRole() {
        $sql = "SELECT role, COUNT(*) as count FROM users GROUP BY role";
        return $this->db->fetchAll($sql);
    }
}