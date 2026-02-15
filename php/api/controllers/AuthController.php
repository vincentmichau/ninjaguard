&lt;?php
/**
 * NightWatch - Contrôleur d'authentification
 */

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../../config/JWT.php';

class AuthController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    /**
     * Connexion utilisateur
     */
    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email et mot de passe requis']);
            return;
        }

        $user = $this->userModel->authenticate($data['email'], $data['password']);

        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Identifiants invalides']);
            return;
        }

        // Générer le token JWT
        $token = JWT::encode([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Connexion réussie',
            'data' => [
                'token' => $token,
                'user' => $user
            ]
        ]);
    }

    /**
     * Inscription utilisateur
     */
    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validation
        $required = ['email', 'password', 'first_name', 'last_name'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => "Le champ $field est requis"]);
                return;
            }
        }

        // Vérifier si l'email existe déjà
        if ($this->userModel->getByEmail($data['email'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Cet email est déjà utilisé']);
            return;
        }

        try {
            $this->userModel->create($data);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Utilisateur créé avec succès'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la création']);
        }
    }

    /**
     * Obtenir l'utilisateur actuel
     */
    public function me() {
        $user = JWT::getCurrentUser();

        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Non authentifié']);
            return;
        }

        $userData = $this->userModel->getById($user['user_id']);

        echo json_encode([
            'success' => true,
            'data' => $userData
        ]);
    }

    /**
     * Changer le mot de passe
     */
    public function changePassword() {
        $user = JWT::getCurrentUser();

        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Non authentifié']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['new_password'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Nouveau mot de passe requis']);
            return;
        }

        if (strlen($data['new_password']) < 8) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Le mot de passe doit contenir au moins 8 caractères']);
            return;
        }

        try {
            $this->userModel->changePassword($user['user_id'], $data['new_password']);

            echo json_encode([
                'success' => true,
                'message' => 'Mot de passe changé avec succès'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur lors du changement de mot de passe']);
        }
    }
}