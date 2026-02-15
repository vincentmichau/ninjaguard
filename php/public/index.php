&lt;?php
/**
 * NightWatch - Point d'entrée principal
 */

// Rediriger vers le login si non connecté
session_start();

if (!isset($_SESSION['token'])) {
    header('Location: /login.php');
    exit();
}

// Rediriger vers le dashboard si connecté
header('Location: /dashboard.php');
exit();