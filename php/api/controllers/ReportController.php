&lt;?php
/**
 * NightWatch - Contrôleur Rapport
 */

require_once __DIR__ . '/../models/Report.php';
require_once __DIR__ . '/../models/Event.php';
require_once __DIR__ . '/../../config/JWT.php';

class ReportController {
    private $reportModel;
    private $eventModel;

    public function __construct() {
        $this->reportModel = new Report();
        $this->eventModel = new Event();
    }

    /**
     * Obtenir tous les rapports
     */
    public function index() {
        $user = JWT::getCurrentUser();

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;

        $filters = [];
        if ($user['role'] === 'watcher') {
            $filters['user_id'] = $user['user_id'];
        }

        if (isset($_GET['site_id'])) {
            $filters['site_id'] = $_GET['site_id'];
        }

        if (isset($_GET['status'])) {
            $filters['status'] = $_GET['status'];
        }

        if (isset($_GET['validated'])) {
            $filters['validated'] = $_GET['validated'];
        }

        if (isset($_GET['date_from'])) {
            $filters['date_from'] = $_GET['date_from'];
        }

        if (isset($_GET['date_to'])) {
            $filters['date_to'] = $_GET['date_to'];
        }

        $reports = $this->reportModel->getAll($page, $limit, $filters);
        $total = $this->reportModel->count($filters);

        echo json_encode([
            'success' => true,
            'data' => $reports,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    /**
     * Obtenir un rapport par ID
     */
    public function show($id) {
        $report = $this->reportModel->getById($id);

        if (!$report) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Rapport non trouvé']);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => $report
        ]);
    }

    /**
     * Créer un nouveau rapport
     */
    public function create() {
        $user = JWT::getCurrentUser();

        $data = json_decode(file_get_contents('php://input'), true);

        // Validation
        $required = ['site_id', 'report_date', 'shift_type', 'start_time'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => "Le champ $field est requis"]);
                return;
            }
        }

        try {
            $data['user_id'] = $user['user_id'];
            $reportId = $this->reportModel->create($data);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Rapport créé avec succès',
                'data' => ['id' => $reportId]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la création']);
        }
    }

    /**
     * Mettre à jour un rapport
     */
    public function update($id) {
        $user = JWT::getCurrentUser();

        $report = $this->reportModel->getById($id);

        if (!$report) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Rapport non trouvé']);
            return;
        }

        // Vérifier que le rapport n'est pas validé
        if ($report['is_validated'] == 1) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Ce rapport est validé et ne peut plus être modifié']);
            return;
        }

        // Vérifier les droits
        if ($user['role'] === 'watcher' && $report['user_id'] != $user['user_id']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Accès refusé']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        try {
            $this->reportModel->update($id, $data);

            echo json_encode([
                'success' => true,
                'message' => 'Rapport mis à jour avec succès'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour']);
        }
    }

    /**
     * Valider un rapport
     */
    public function validate($id) {
        $user = JWT::getCurrentUser();

        if ($user['role'] === 'watcher') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Accès réservé aux superviseurs et administrateurs']);
            return;
        }

        $report = $this->reportModel->getById($id);

        if (!$report) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Rapport non trouvé']);
            return;
        }

        try {
            $this->reportModel->validate($id, $user['user_id']);

            echo json_encode([
                'success' => true,
                'message' => 'Rapport validé avec succès'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la validation']);
        }
    }

    /**
     * Supprimer un rapport
     */
    public function delete($id) {
        $user = JWT::getCurrentUser();

        $report = $this->reportModel->getById($id);

        if (!$report) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Rapport non trouvé']);
            return;
        }

        // Seul l'auteur peut supprimer son rapport non validé
        if ($user['role'] === 'watcher') {
            if ($report['user_id'] != $user['user_id']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Accès refusé']);
                return;
            }
            if ($report['is_validated'] == 1) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Ce rapport est validé et ne peut plus être supprimé']);
                return;
            }
        }

        try {
            $this->reportModel->delete($id);

            echo json_encode([
                'success' => true,
                'message' => 'Rapport supprimé avec succès'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la suppression']);
        }
    }

    /**
     * Obtenir les statistiques
     */
    public function stats() {
        $user = JWT::getCurrentUser();
        $userId = $user['role'] === 'watcher' ? $user['user_id'] : null;

        $stats = $this->reportModel->getStats($userId);

        echo json_encode([
            'success' => true,
            'data' => $stats
        ]);
    }
}