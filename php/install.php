&lt;?php
/**
 * NightWatch - Script d'installation
 * Exécutez ce fichier pour configurer l'application automatiquement
 */

set_time_limit(300);

// Version
define('VERSION', '1.0.0');

// Messages d'erreur
$errors = [];
$success = [];

// Vérifier PHP
function checkPHP() {
    if (version_compare(PHP_VERSION, '8.0.0', '>=')) {
        return true;
    }
    return false;
}

// Vérifier les extensions PHP
function checkExtensions() {
    $required = ['pdo', 'pdo_mysql', 'json', 'mbstring'];
    $missing = [];
    
    foreach ($required as $ext) {
        if (!extension_loaded($ext)) {
            $missing[] = $ext;
        }
    }
    
    return $missing;
}

// Tester la connexion MySQL
function testConnection($host, $user, $pass, $database) {
    try {
        $dsn = "mysql:host=$host;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Créer la base de données si elle n'existe pas
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        
        return true;
    } catch (PDOException $e) {
        return $e->getMessage();
    }
}

// Importer le schéma SQL
function importSchema($host, $user, $pass, $database, $schemaFile) {
    try {
        $dsn = "mysql:host=$host;dbname=$database;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        if (!file_exists($schemaFile)) {
            throw new Exception("Fichier de schéma non trouvé: $schemaFile");
        }
        
        $sql = file_get_contents($schemaFile);
        
        // Exécuter le SQL
        $pdo->exec($sql);
        
        return true;
    } catch (Exception $e) {
        return $e->getMessage();
    }
}

// Créer le fichier de configuration
function createConfig($data) {
    $configContent = &lt;&lt;&lt;PHP
&lt;?php
/**
 * NightWatch - Configuration principale
 */

// Configuration de l'environnement
define('ENVIRONMENT', 'production');
define('BASE_URL', '{$data['base_url']}');
define('API_URL', BASE_URL . '/api');

// Configuration de la base de données
define('DB_HOST', '{$data['db_host']}');
define('DB_NAME', '{$data['db_name']}');
define('DB_USER', '{$data['db_user']}');
define('DB_PASS', '{$data['db_pass']}');
define('DB_CHARSET', 'utf8mb4');

// Configuration JWT
define('JWT_SECRET', '{$data['jwt_secret']}');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRATION', 86400);

// Configuration des fichiers uploadés
define('UPLOAD_DIR', __DIR__ . '/../public/uploads');
define('MAX_FILE_SIZE', 5242880);
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']);

// Configuration email
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'your-email@gmail.com');
define('SMTP_PASS', 'your-password');
define('SMTP_FROM', 'noreply@nightwatch.fr');
define('SMTP_FROM_NAME', 'NightWatch');

// Configuration des rôles utilisateurs
define('ROLE_ADMIN', 'admin');
define('ROLE_SUPERVISOR', 'supervisor');
define('ROLE_WATCHER', 'watcher');

// Configuration pagination
define('ITEMS_PER_PAGE', 20);

// Zone horaire
date_default_timezone_set('Europe/Paris');

// Gestion des erreurs
if (ENVIRONMENT === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Configuration CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
PHP;

    $configFile = __DIR__ . '/config/config.php';
    
    if (file_put_contents($configFile, $configContent)) {
        return true;
    }
    
    return false;
}

// Créer les dossiers nécessaires
function createDirectories() {
    $dirs = [
        __DIR__ . '/public/uploads',
        __DIR__ . '/logs'
    ];
    
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
    
    return true;
}

// Traitement du formulaire
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $step = isset($_POST['step']) ? $_POST['step'] : 1;
    
    switch ($step) {
        case 1:
            // Vérifications système
            $phpOk = checkPHP();
            $extensions = checkExtensions();
            
            if (!$phpOk) {
                $errors[] = "PHP " . PHP_VERSION . " détecté. PHP 8.0 ou supérieur requis.";
            }
            
            if (!empty($extensions)) {
                $errors[] = "Extensions PHP manquantes: " . implode(', ', $extensions);
            }
            
            if (empty($errors)) {
                $success[] = "Vérifications système réussies";
                $step = 2;
            }
            break;
            
        case 2:
            // Test de connexion MySQL
            $result = testConnection(
                $_POST['db_host'],
                $_POST['db_user'],
                $_POST['db_pass'],
                $_POST['db_name']
            );
            
            if ($result === true) {
                $success[] = "Connexion MySQL réussie";
                $step = 3;
            } else {
                $errors[] = "Erreur de connexion MySQL: $result";
            }
            break;
            
        case 3:
            // Import du schéma
            $result = importSchema(
                $_POST['db_host'],
                $_POST['db_user'],
                $_POST['db_pass'],
                $_POST['db_name'],
                __DIR__ . '/database/schema.sql'
            );
            
            if ($result === true) {
                $success[] = "Base de données importée avec succès";
                $step = 4;
            } else {
                $errors[] = "Erreur lors de l'import: $result";
            }
            break;
            
        case 4:
            // Création de la configuration
            $configData = [
                'base_url' => rtrim($_POST['base_url'], '/'),
                'db_host' => $_POST['db_host'],
                'db_name' => $_POST['db_name'],
                'db_user' => $_POST['db_user'],
                'db_pass' => $_POST['db_pass'],
                'jwt_secret' => $_POST['jwt_secret']
            ];
            
            $result = createConfig($configData);
            
            if ($result === true) {
                createDirectories();
                $success[] = "Configuration créée avec succès";
                $step = 5;
            } else {
                $errors[] = "Erreur lors de la création de la configuration";
            }
            break;
    }
} else {
    $step = 1;
}
?&gt;
&lt;!DOCTYPE html&gt;
&lt;html lang="fr"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
    &lt;title&gt;NightWatch - Installation&lt;/title&gt;
    &lt;link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"&gt;
    &lt;link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"&gt;
    &lt;style&gt;
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .install-card {
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 600px;
            width: 100%;
            overflow: hidden;
        }
        .install-header {
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .install-body {
            padding: 30px;
        }
        .step-indicator {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            position: relative;
        }
        .step-indicator::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 0;
            right: 0;
            height: 2px;
            background: #e0e0e0;
            z-index: 0;
        }
        .step {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background: #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            position: relative;
            z-index: 1;
        }
        .step.active {
            background: #3498db;
            color: white;
        }
        .step.completed {
            background: #27ae60;
            color: white;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .btn-install {
            background: linear-gradient(135deg, #3498db, #2980b9);
            border: none;
            padding: 12px 30px;
        }
        .btn-install:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
        }
    &lt;/style&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;div class="install-card"&gt;
        &lt;div class="install-header"&gt;
            &lt;h1&gt;&lt;i class="fas fa-shield-alt"&gt;&lt;/i&gt; NightWatch&lt;/h1&gt;
            &lt;p class="mb-0"&gt;Assistant d'installation v&lt;?php echo VERSION; ?&gt;&lt;/p&gt;
        &lt;/div&gt;
        
        &lt;div class="install-body"&gt;
            &lt;?php if (!empty($errors)): ?&gt;
                &lt;div class="alert alert-danger"&gt;
                    &lt;i class="fas fa-exclamation-triangle"&gt;&lt;/i&gt;
                    &lt;strong&gt;Erreur:&lt;/strong&gt;&lt;br&gt;
                    &lt;?php echo implode('&lt;br&gt;', $errors); ?&gt;
                &lt;/div&gt;
            &lt;/?php&gt;
            
            &lt;?php if (!empty($success)): ?&gt;
                &lt;div class="alert alert-success"&gt;
                    &lt;i class="fas fa-check-circle"&gt;&lt;/i&gt;
                    &lt;strong&gt;Succès:&lt;/strong&gt;&lt;br&gt;
                    &lt;?php echo implode('&lt;br&gt;', $success); ?&gt;
                &lt;/div&gt;
            &lt;/?php&gt;
            
            &lt;!-- Indicateur d'étape --&gt;
            &lt;div class="step-indicator"&gt;
                &lt;div class="step &lt;?php echo $step >= 1 ? ($step > 1 ? 'completed' : 'active') : ''; ?&gt;"&gt;1&lt;/div&gt;
                &lt;div class="step &lt;?php echo $step >= 2 ? ($step > 2 ? 'completed' : 'active') : ''; ?&gt;"&gt;2&lt;/div&gt;
                &lt;div class="step &lt;?php echo $step >= 3 ? ($step > 3 ? 'completed' : 'active') : ''; ?&gt;"&gt;3&lt;/div&gt;
                &lt;div class="step &lt;?php echo $step >= 4 ? ($step > 4 ? 'completed' : 'active') : ''; ?&gt;"&gt;4&lt;/div&gt;
            &lt;/div&gt;
            
            &lt;?php if ($step == 5): ?&gt;
                &lt;!-- Installation terminée --&gt;
                &lt;div class="text-center"&gt;
                    &lt;i class="fas fa-check-circle text-success" style="font-size: 80px;"&gt;&lt;/i&gt;
                    &lt;h3 class="mt-3"&gt;Installation terminée !&lt;/h3&gt;
                    &lt;p class="text-muted"&gt;NightWatch a été installé avec succès.&lt;/p&gt;
                    
                    &lt;div class="alert alert-info text-start"&gt;
                        &lt;strong&gt;Informations de connexion :&lt;/strong&gt;
                        &lt;ul class="mb-0"&gt;
                            &lt;li&gt;URL : &lt;a href="&lt;?php echo isset($_POST['base_url']) ? $_POST['base_url'] : '/public'; ?&gt;"&gt;&lt;?php echo isset($_POST['base_url']) ? $_POST['base_url'] : '/public'; ?&gt;&lt;/a&gt;&lt;/li&gt;
                            &lt;li&gt;Email : admin@nightwatch.fr&lt;/li&gt;
                            &lt;li&gt;Mot de passe : Admin123!&lt;/li&gt;
                        &lt;/ul&gt;
                    &lt;/div&gt;
                    
                    &lt;div class="alert alert-warning text-start"&gt;
                        &lt;strong&gt;⚠️ IMPORTANT :&lt;/strong&gt;
                        &lt;ul class="mb-0"&gt;
                            &lt;li&gt;Changez le mot de passe administrateur dès la première connexion&lt;/li&gt;
                            &lt;li&gt;Supprimez ce fichier d'installation (install.php) pour des raisons de sécurité&lt;/li&gt;
                            &lt;li&gt;Configurez les paramètres email dans config/config.php&lt;/li&gt;
                        &lt;/ul&gt;
                    &lt;/div&gt;
                    
                    &lt;a href="&lt;?php echo isset($_POST['base_url']) ? $_POST['base_url'] . '/login.php' : '/public/login.php'; ?&gt;" 
                       class="btn btn-success btn-lg"&gt;
                        &lt;i class="fas fa-sign-in-alt"&gt;&lt;/i&gt; Se connecter
                    &lt;/a&gt;
                &lt;/div&gt;
            &lt;?php else: ?&gt;
                &lt;!-- Formulaire d'installation --&gt;
                &lt;form method="POST"&gt;
                    &lt;input type="hidden" name="step" value="&lt;?php echo $step + 1; ?&gt;"&gt;
                    
                    &lt;?php if ($step == 1): ?&gt;
                        &lt;!-- Étape 1 : Vérifications --&gt;
                        &lt;h5&gt;Étape 1 : Vérifications système&lt;/h5&gt;
                        &lt;ul class="list-unstyled"&gt;
                            &lt;li class="mb-2"&gt;
                                &lt;i class="fas &lt;?php echo checkPHP() ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'; ?&gt;"&gt;&lt;/i&gt;
                                PHP &lt;?php echo PHP_VERSION; ?&gt; (requis: 8.0+)
                            &lt;/li&gt;
                            &lt;li class="mb-2"&gt;
                                &lt;i class="fas &lt;?php echo empty(checkExtensions()) ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'; ?&gt;"&gt;&lt;/i&gt;
                                Extensions PHP requises
                                &lt;?php $exts = checkExtensions(); if (!empty($exts)): ?&gt;
                                    &lt;br&gt;&lt;small class="text-danger"&gt;Manquantes: &lt;?php echo implode(', ', $exts); ?&gt;&lt;/small&gt;
                                &lt;?php endif; ?&gt;
                            &lt;/li&gt;
                        &lt;/ul&gt;
                        &lt;button type="submit" class="btn btn-install w-100" &lt;?php echo !empty($errors) ? 'disabled' : ''; ?&gt;&gt;
                            Suivant &lt;i class="fas fa-arrow-right"&gt;&lt;/i&gt;
                        &lt;/button&gt;
                    &lt;?php elseif ($step == 2): ?&gt;
                        &lt;!-- Étape 2 : Configuration MySQL --&gt;
                        &lt;h5&gt;Étape 2 : Configuration MySQL&lt;/h5&gt;
                        &lt;div class="form-group"&gt;
                            &lt;label&gt;Hôte MySQL&lt;/label&gt;
                            &lt;input type="text" name="db_host" class="form-control" value="localhost" required&gt;
                        &lt;/div&gt;
                        &lt;div class="form-group"&gt;
                            &lt;label&gt;Nom de la base de données&lt;/label&gt;
                            &lt;input type="text" name="db_name" class="form-control" value="nightwatch_php" required&gt;
                        &lt;/div&gt;
                        &lt;div class="form-group"&gt;
                            &lt;label&gt;Utilisateur MySQL&lt;/label&gt;
                            &lt;input type="text" name="db_user" class="form-control" value="root" required&gt;
                        &lt;/div&gt;
                        &lt;div class="form-group"&gt;
                            &lt;label&gt;Mot de passe MySQL&lt;/label&gt;
                            &lt;input type="password" name="db_pass" class="form-control"&gt;
                        &lt;/div&gt;
                        &lt;button type="submit" class="btn btn-install w-100"&gt;
                            Tester et continuer &lt;i class="fas fa-arrow-right"&gt;&lt;/i&gt;
                        &lt;/button&gt;
                    &lt;?php elseif ($step == 3): ?&gt;
                        &lt;!-- Étape 3 : Import du schéma --&gt;
                        &lt;h5&gt;Étape 3 : Import de la base de données&lt;/h5&gt;
                        &lt;p&gt;Le schéma de la base de données va être importé automatiquement.&lt;/p&gt;
                        &lt;input type="hidden" name="db_host" value="&lt;?php echo $_POST['db_host']; ?&gt;"&gt;
                        &lt;input type="hidden" name="db_name" value="&lt;?php echo $_POST['db_name']; ?&gt;"&gt;
                        &lt;input type="hidden" name="db_user" value="&lt;?php echo $_POST['db_user']; ?&gt;"&gt;
                        &lt;input type="hidden" name="db_pass" value="&lt;?php echo $_POST['db_pass']; ?&gt;"&gt;
                        &lt;button type="submit" class="btn btn-install w-100"&gt;
                            Importer et continuer &lt;i class="fas fa-arrow-right"&gt;&lt;/i&gt;
                        &lt;/button&gt;
                    &lt;?php elseif ($step == 4): ?&gt;
                        &lt;!-- Étape 4 : Configuration finale --&gt;
                        &lt;h5&gt;Étape 4 : Configuration finale&lt;/h5&gt;
                        &lt;div class="form-group"&gt;
                            &lt;label&gt;URL de base de l'application&lt;/label&gt;
                            &lt;input type="url" name="base_url" class="form-control" value="http://localhost:8000" required&gt;
                            &lt;small class="text-muted"&gt;Ex: http://localhost:8000 ou https://votre-domaine.com&lt;/small&gt;
                        &lt;/div&gt;
                        &lt;div class="form-group"&gt;
                            &lt;label&gt;Clé secrète JWT&lt;/label&gt;
                            &lt;input type="text" name="jwt_secret" class="form-control" value="&lt;?php echo bin2hex(random_bytes(32)); ?&gt;" required&gt;
                            &lt;small class="text-muted"&gt;Générée automatiquement. Ne la changez que si nécessaire.&lt;/small&gt;
                        &lt;/div&gt;
                        &lt;input type="hidden" name="db_host" value="&lt;?php echo $_POST['db_host']; ?&gt;"&gt;
                        &lt;input type="hidden" name="db_name" value="&lt;?php echo $_POST['db_name']; ?&gt;"&gt;
                        &lt;input type="hidden" name="db_user" value="&lt;?php echo $_POST['db_user']; ?&gt;"&gt;
                        &lt;input type="hidden" name="db_pass" value="&lt;?php echo $_POST['db_pass']; ?&gt;"&gt;
                        &lt;button type="submit" class="btn btn-install w-100"&gt;
                            Terminer l'installation &lt;i class="fas fa-check"&gt;&lt;/i&gt;
                        &lt;/button&gt;
                    &lt;?php endif; ?&gt;
                &lt;/form&gt;
            &lt;/?php&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    
    &lt;script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"&gt;&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;