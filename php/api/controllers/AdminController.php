&lt;?php
/**
 * NightWatch - Contrôleur Admin
 */

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Site.php';
require_once __DIR__ . '/../models/Client.php';
require_once __DIR__ . '/../models/Report.php';

class AdminController {
    private $userModel;
    private $siteModel;
    private $clientModel;
    private $reportModel;

    public function __construct() {
        $this->userModel = new User();
        $this->siteModel = new Site();
        $this->clientModel = new Client();
        $this->reportModel = new Report();
    }

    /**
     * Tableau de bord admin
     */
    public function dashboard() {
        $stats = [
            'users' => $this->userModel->count(),
            'sites' => $this->siteModel->count(),
            'clients' => $this->clientModel->count(),
            'reports' => $this->reportModel->count(),
            'users_by_role' => $this->userModel->getStatsByRole(),
            'reports_stats' => $this->reportModel->getStats()
        ];

        echo json_encode([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Gestion des utilisateurs
     */
    public function users() {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;

        $users = $this->userModel->getAll($page, $limit);
        $total = $this->userModel->count();

        echo json_encode([
            'success' => true,
            'data' => $users,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    /**
     * Créer un utilisateur
     */
    public function createUser() {
        $data = json_decode(file_get_contents('php://input'), true);

        $required = ['email', 'password', 'first_name', 'last_name', 'role'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => "Le champ $field est requis"]);
                return;
            }
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
     * Mettre à jour un utilisateur
     */
    public function updateUser($id) {
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            $this->userModel->update($id, $data);

            echo json_encode([
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour']);
        }
    }

    /**
     * Supprimer un utilisateur
     */
    public function deleteUser($id) {
        try {
            $this->userModel->delete($id);

            echo json_encode([
                'success' => true,
                'message' => 'Utilisateur supprimé avec succès'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la suppression']);
        }
    }

    /**
     * Gestion des sites
     */
    public function sites() {
        $sites = $this->siteModel->getAll();

        echo json_encode([
            'success' => true,
            'data' => $sites
        ]);
    }

    /**
     * Créer un site
     */
    public function createSite() {
        $data = json_decode(file_get_contents('php://input'), true);

        $required = ['client_id', 'name', 'address'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => "Le champ $field est requis"]);
                return;
            }
        }

        try {
            $this->siteModel->create($data);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Site créé avec succès'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la création']);
        }
    }

    /**
     * Mettre à jour un site
     */
    public function updateSite($id) {
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            $this->siteModel->update($id, $data);

            echo json_encode([
                'success' => true,
                'message' => 'Site mis à jour avec succès'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour']);
        }
    }

    /**
     * Supprimer un site
     */
    public function deleteSite($id) {
        try {
            $this->siteModel->delete($id);

            echo json_encode([
                'success' => true,
                'message' => 'Site supprimé avec succès'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la suppression']);
        }
    }

    /**
     * Gestion des clients
     */
    public function clients() {
        $clients = $this->clientModel->getAll();

        echo json_encode([
            'success' => true,
            'data' => $clients
        ]);
    }

    /**
     * Créer un client
     */
    public function createClient() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['name'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Le nom est requis']);
            return;
        }

        try {
            $this->clientModel->create($data);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Client créé avec succès'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la création']);
        }
    }

    /**
     * Mettre à jour un client
     */
    public function updateClient($id) {
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            $this->clientModel->update($id, $data);

            echo json_encode([
                'success' => true,
                'message' => 'Client mis à jour avec succès'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour']);
        }
    }

    /**
     * Supprimer un client
     */
    public function deleteClient($id) {
        try {
            $this->clientModel->delete($id);

            echo json_encode([
                'success' => true,
                'message' => 'Client supprimé avec succès'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la suppression']);
        }
    }
}