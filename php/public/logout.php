&lt;?php
/**
 * NightWatch - Déconnexion
 */

session_start();

session_destroy();

// Rediriger vers la page de connexion
header('Location: /login.php');
exit();