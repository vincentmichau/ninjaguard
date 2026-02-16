&lt;?php
/**
 * NightWatch - Middleware d'authentification
 */

require_once __DIR__ . '/../../config/JWT.php';

class AuthMiddleware {
    /**
     * Vérifie si l'utilisateur est authentifié
     */
    public static function authenticate() {
        try {
            $user = JWT::getCurrentUser();
            
            if (!$user) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Non authentifié']);
                exit();
            }
            
            return $user;
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Token invalide: ' . $e->getMessage()]);
            exit();
        }
    }

    /**
     * Vérifie si l'utilisateur a le rôle requis
     */
    public static function checkRole($requiredRole) {
        $user = self::authenticate();
        
        $roleHierarchy = [
            'admin' => 3,
            'supervisor' => 2,
            'watcher' => 1
        ];
        
        if (!isset($roleHierarchy[$user['role']]) || 
            $roleHierarchy[$user['role']] < $roleHierarchy[$requiredRole]) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Accès refusé']);
            exit();
        }
        
        return $user;
    }

    /**
     * Vérifie si l'utilisateur est admin ou superviseur
     */
    public static function requireAdminOrSupervisor() {
        $user = self::authenticate();
        
        if ($user['role'] !== 'admin' && $user['role'] !== 'supervisor') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Accès réservé aux administrateurs et superviseurs']);
            exit();
        }
        
        return $user;
    }

    /**
     * Vérifie si l'utilisateur est admin
     */
    public static function requireAdmin() {
        $user = self::authenticate();
        
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Accès réservé aux administrateurs']);
            exit();
        }
        
        return $user;
    }
}