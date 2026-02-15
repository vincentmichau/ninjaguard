&lt;?php
/**
 * NightWatch - Routes API
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/ReportController.php';
require_once __DIR__ . '/../controllers/AdminController.php';

// Définir l'en-tête JSON
header('Content-Type: application/json');

// Obtenir la méthode et l'URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Supprimer le préfixe /api
$path = str_replace('/api', '', $uri);

// Router les requêtes
switch (true) {
    // Routes d'authentification (publiques)
    case $path === '/auth/login' && $method === 'POST':
        $controller = new AuthController();
        $controller->login();
        break;

    case $path === '/auth/register' && $method === 'POST':
        $controller = new AuthController();
        $controller->register();
        break;

    // Routes utilisateur authentifié
    case $path === '/auth/me' && $method === 'GET':
        AuthMiddleware::authenticate();
        $controller = new AuthController();
        $controller->me();
        break;

    case $path === '/auth/change-password' && $method === 'POST':
        AuthMiddleware::authenticate();
        $controller = new AuthController();
        $controller->changePassword();
        break;

    // Routes des rapports
    case preg_match('#^/reports$#', $path) && $method === 'GET':
        AuthMiddleware::authenticate();
        $controller = new ReportController();
        $controller->index();
        break;

    case preg_match('#^/reports$#', $path) && $method === 'POST':
        AuthMiddleware::authenticate();
        $controller = new ReportController();
        $controller->create();
        break;

    case preg_match('#^/reports/(\d+)$#', $path, $matches) && $method === 'GET':
        AuthMiddleware::authenticate();
        $controller = new ReportController();
        $controller->show($matches[1]);
        break;

    case preg_match('#^/reports/(\d+)$#', $path, $matches) && $method === 'PUT':
        AuthMiddleware::authenticate();
        $controller = new ReportController();
        $controller->update($matches[1]);
        break;

    case preg_match('#^/reports/(\d+)/validate$#', $path, $matches) && $method === 'POST':
        AuthMiddleware::requireAdminOrSupervisor();
        $controller = new ReportController();
        $controller->validate($matches[1]);
        break;

    case preg_match('#^/reports/(\d+)$#', $path, $matches) && $method === 'DELETE':
        AuthMiddleware::authenticate();
        $controller = new ReportController();
        $controller->delete($matches[1]);
        break;

    case $path === '/reports/stats' && $method === 'GET':
        AuthMiddleware::authenticate();
        $controller = new ReportController();
        $controller->stats();
        break;

    // Routes admin
    case $path === '/admin/dashboard' && $method === 'GET':
        AuthMiddleware::requireAdmin();
        $controller = new AdminController();
        $controller->dashboard();
        break;

    case $path === '/admin/users' && $method === 'GET':
        AuthMiddleware::requireAdmin();
        $controller = new AdminController();
        $controller->users();
        break;

    case $path === '/admin/users' && $method === 'POST':
        AuthMiddleware::requireAdmin();
        $controller = new AdminController();
        $controller->createUser();
        break;

    case preg_match('#^/admin/users/(\d+)$#', $path, $matches) && $method === 'PUT':
        AuthMiddleware::requireAdmin();
        $controller = new AdminController();
        $controller->updateUser($matches[1]);
        break;

    case preg_match('#^/admin/users/(\d+)$#', $path, $matches) && $method === 'DELETE':
        AuthMiddleware::requireAdmin();
        $controller = new AdminController();
        $controller->deleteUser($matches[1]);
        break;

    case $path === '/admin/sites' && $method === 'GET':
        AuthMiddleware::requireAdmin();
        $controller = new AdminController();
        $controller->sites();
        break;

    case $path === '/admin/sites' && $method === 'POST':
        AuthMiddleware::requireAdmin();
        $controller = new AdminController();
        $controller->createSite();
        break;

    case preg_match('#^/admin/sites/(\d+)$#', $path, $matches) && $method === 'PUT':
        AuthMiddleware::requireAdmin();
        $controller = new AdminController();
        $controller->updateSite($matches[1]);
        break;

    case preg_match('#^/admin/sites/(\d+)$#', $path, $matches) && $method === 'DELETE':
        AuthMiddleware::requireAdmin();
        $controller = new AdminController();
        $controller->deleteSite($matches[1]);
        break;

    case $path === '/admin/clients' && $method === 'GET':
        AuthMiddleware::requireAdmin();
        $controller = new AdminController();
        $controller->clients();
        break;

    case $path === '/admin/clients' && $method === 'POST':
        AuthMiddleware::requireAdmin();
        $controller = new AdminController();
        $controller->createClient();
        break;

    case preg_match('#^/admin/clients/(\d+)$#', $path, $matches) && $method === 'PUT':
        AuthMiddleware::requireAdmin();
        $controller = new AdminController();
        $controller->updateClient($matches[1]);
        break;

    case preg_match('#^/admin/clients/(\d+)$#', $path, $matches) && $method === 'DELETE':
        AuthMiddleware::requireAdmin();
        $controller = new AdminController();
        $controller->deleteClient($matches[1]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Route non trouvée']);
        break;
}