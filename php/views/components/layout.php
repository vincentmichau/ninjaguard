&lt;?php
/**
 * NightWatch - Layout principal
 */

session_start();

$user = isset($_SESSION['user']) ? json_decode($_SESSION['user'], true) : null;
?>
&lt;!DOCTYPE html&gt;
&lt;html lang="fr"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
    &lt;title&gt;NightWatch - Gestion de Rondes&lt;/title&gt;
    
    &lt;!-- Bootstrap CSS --&gt;
    &lt;link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"&gt;
    
    &lt;!-- Font Awesome --&gt;
    &lt;link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"&gt;
    
    &lt;!-- Styles personnalisés --&gt;
    &lt;link href="/assets/css/style.css" rel="stylesheet"&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;?php if ($user): ?&gt;
    &lt;!-- Navigation --&gt;
    &lt;nav class="navbar navbar-expand-lg navbar-dark"&gt;
        &lt;div class="container-fluid"&gt;
            &lt;a class="navbar-brand" href="/dashboard.php"&gt;
                &lt;i class="fas fa-shield-alt"&gt;&lt;/i&gt; NightWatch
            &lt;/a&gt;
            
            &lt;button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"&gt;
                &lt;span class="navbar-toggler-icon"&gt;&lt;/span&gt;
            &lt;/button&gt;
            
            &lt;div class="collapse navbar-collapse" id="navbarNav"&gt;
                &lt;ul class="navbar-nav me-auto"&gt;
                    &lt;li class="nav-item"&gt;
                        &lt;a class="nav-link &lt;?php echo basename($_SERVER['PHP_SELF']) == 'dashboard.php' ? 'active' : ''; ?&gt;" 
                           href="/dashboard.php"&gt;
                            &lt;i class="fas fa-tachometer-alt"&gt;&lt;/i&gt; Tableau de bord
                        &lt;/a&gt;
                    &lt;/li&gt;
                    &lt;li class="nav-item"&gt;
                        &lt;a class="nav-link &lt;?php echo basename($_SERVER['PHP_SELF']) == 'reports.php' ? 'active' : ''; ?&gt;" 
                           href="/reports.php"&gt;
                            &lt;i class="fas fa-file-alt"&gt;&lt;/i&gt; Rapports
                        &lt;/a&gt;
                    &lt;/li&gt;
                    &lt;li class="nav-item"&gt;
                        &lt;a class="nav-link &lt;?php echo basename($_SERVER['PHP_SELF']) == 'report-form.php' ? 'active' : ''; ?&gt;" 
                           href="/report-form.php"&gt;
                            &lt;i class="fas fa-plus-circle"&gt;&lt;/i&gt; Nouveau Rapport
                        &lt;/a&gt;
                    &lt;/li&gt;
                    &lt;li class="nav-item"&gt;
                        &lt;a class="nav-link &lt;?php echo basename($_SERVER['PHP_SELF']) == 'history.php' ? 'active' : ''; ?&gt;" 
                           href="/history.php"&gt;
                            &lt;i class="fas fa-history"&gt;&lt;/i&gt; Historique
                        &lt;/a&gt;
                    &lt;/li&gt;
                    &lt;li class="nav-item"&gt;
                        &lt;a class="nav-link &lt;?php echo basename($_SERVER['PHP_SELF']) == 'chat.php' ? 'active' : ''; ?&gt;" 
                           href="/chat.php"&gt;
                            &lt;i class="fas fa-comments"&gt;&lt;/i&gt; Chat
                        &lt;/a&gt;
                    &lt;/li&gt;
                    &lt;?php if ($user['role'] === 'admin' || $user['role'] === 'supervisor'): ?&gt;
                    &lt;li class="nav-item"&gt;
                        &lt;a class="nav-link &lt;?php echo basename($_SERVER['PHP_SELF']) == 'admin.php' ? 'active' : ''; ?&gt;" 
                           href="/admin.php"&gt;
                            &lt;i class="fas fa-cog"&gt;&lt;/i&gt; Administration
                        &lt;/a&gt;
                    &lt;/li&gt;
                    &lt;?php endif; ?&gt;
                &lt;/ul&gt;
                
                &lt;ul class="navbar-nav ms-auto"&gt;
                    &lt;li class="nav-item dropdown"&gt;
                        &lt;a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" 
                           data-bs-toggle="dropdown"&gt;
                            &lt;i class="fas fa-user-circle"&gt;&lt;/i&gt; 
                            &lt;?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?&gt;
                        &lt;/a&gt;
                        &lt;ul class="dropdown-menu dropdown-menu-end"&gt;
                            &lt;li&gt;&lt;a class="dropdown-item" href="/profile.php"&gt;
                                &lt;i class="fas fa-user-cog"&gt;&lt;/i&gt; Mon Profil
                            &lt;/a&gt;&lt;/li&gt;
                            &lt;li&gt;&lt;hr class="dropdown-divider"&gt;&lt;/li&gt;
                            &lt;li&gt;&lt;a class="dropdown-item" href="/logout.php"&gt;
                                &lt;i class="fas fa-sign-out-alt"&gt;&lt;/i&gt; Déconnexion
                            &lt;/a&gt;&lt;/li&gt;
                        &lt;/ul&gt;
                    &lt;/li&gt;
                &lt;/ul&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/nav&gt;
    &lt;?php endif; ?&gt;
    
    &lt;!-- Contenu principal --&gt;
    &lt;main&gt;
        &lt;?php if (isset($content)): ?&gt;
            &lt;?php echo $content; ?&gt;
        &lt;?php endif; ?&gt;
    &lt;/main&gt;
    
    &lt;!-- Scripts --&gt;
    &lt;script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"&gt;&lt;/script&gt;
    &lt;script src="/assets/js/app.js"&gt;&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;