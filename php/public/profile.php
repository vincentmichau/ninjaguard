&lt;?php
/**
 * NightWatch - Profil utilisateur
 */

session_start();

// Vérifier l'authentification
if (!isset($_SESSION['token'])) {
    header('Location: /login.php');
    exit();
}

$user = json_decode($_SESSION['user'], true);

// Charger le layout
$content = ob_get_clean();

ob_start();
?&gt;
&lt;div class="container-fluid py-4"&gt;
    &lt;div class="row justify-content-center"&gt;
        &lt;div class="col-md-8"&gt;
            &lt;div class="card fade-in"&gt;
                &lt;div class="card-header"&gt;
                    &lt;h4 class="mb-0"&gt;&lt;i class="fas fa-user-cog"&gt;&lt;/i&gt; Mon Profil&lt;/h4&gt;
                &lt;/div&gt;
                &lt;div class="card-body"&gt;
                    &lt;div class="row"&gt;
                        &lt;!-- Informations personnelles --&gt;
                        &lt;div class="col-md-6"&gt;
                            &lt;div class="card mb-4"&gt;
                                &lt;div class="card-header"&gt;
                                    &lt;h5 class="mb-0"&gt;&lt;i class="fas fa-user"&gt;&lt;/i&gt; Informations Personnelles&lt;/h5&gt;
                                &lt;/div&gt;
                                &lt;div class="card-body"&gt;
                                    &lt;div class="text-center mb-4"&gt;
                                        &lt;div class="display-1 text-primary mb-3"&gt;
                                            &lt;i class="fas fa-user-circle"&gt;&lt;/i&gt;
                                        &lt;/div&gt;
                                        &lt;h4&gt;&lt;?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?&gt;&lt;/h4&gt;
                                        &lt;p class="text-muted"&gt;&lt;?php echo htmlspecialchars($user['email']); ?&gt;&lt;/p&gt;
                                        &lt;span class="badge badge-primary"&gt;Rôle: &lt;?php echo ucfirst($user['role']); ?&gt;&lt;/span&gt;
                                    &lt;/div&gt;
                                    
                                    &lt;table class="table table-borderless"&gt;
                                        &lt;tr&gt;
                                            &lt;th&gt;Prénom:&lt;/th&gt;
                                            &lt;td&gt;&lt;strong&gt;&lt;?php echo htmlspecialchars($user['first_name']); ?&gt;&lt;/strong&gt;&lt;/td&gt;
                                        &lt;/tr&gt;
                                        &lt;tr&gt;
                                            &lt;th&gt;Nom:&lt;/th&gt;
                                            &lt;td&gt;&lt;strong&gt;&lt;?php echo htmlspecialchars($user['last_name']); ?&gt;&lt;/strong&gt;&lt;/td&gt;
                                        &lt;/tr&gt;
                                        &lt;tr&gt;
                                            &lt;th&gt;Email:&lt;/th&gt;
                                            &lt;td&gt;&lt;?php echo htmlspecialchars($user['email']); ?&gt;&lt;/td&gt;
                                        &lt;/tr&gt;
                                        &lt;tr&gt;
                                            &lt;th&gt;Téléphone:&lt;/th&gt;
                                            &lt;td&gt;&lt;?php echo htmlspecialchars($user['phone'] ?? 'Non renseigné'); ?&gt;&lt;/td&gt;
                                        &lt;/tr&gt;
                                        &lt;tr&gt;
                                            &lt;th&gt;Compte créé le:&lt;/th&gt;
                                            &lt;td&gt;&lt;?php echo new DateTime($user['created_at'])->format('d/m/Y H:i'); ?&gt;&lt;/td&gt;
                                        &lt;/tr&gt;
                                        &lt;tr&gt;
                                            &lt;th&gt;Statut:&lt;/th&gt;
                                            &lt;td&gt;
                                                &lt;?php if ($user['is_active']): ?&gt;
                                                    &lt;span class="badge badge-success"&gt;&lt;i class="fas fa-check-circle"&gt;&lt;/i&gt; Actif&lt;/span&gt;
                                                &lt;?php else: ?&gt;
                                                    &lt;span class="badge badge-danger"&gt;&lt;i class="fas fa-times-circle"&gt;&lt;/i&gt; Inactif&lt;/span&gt;
                                                &lt;?php endif; ?&gt;
                                            &lt;/td&gt;
                                        &lt;/tr&gt;
                                    &lt;/table&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                        
                        &lt;!-- Changer le mot de passe --&gt;
                        &lt;div class="col-md-6"&gt;
                            &lt;div class="card"&gt;
                                &lt;div class="card-header"&gt;
                                    &lt;h5 class="mb-0"&gt;&lt;i class="fas fa-key"&gt;&lt;/i&gt; Changer le Mot de Passe&lt;/h5&gt;
                                &lt;/div&gt;
                                &lt;div class="card-body"&gt;
                                    &lt;form id="passwordForm" data-action="/auth/change-password" data-method="POST"&gt;
                                        &lt;div class="mb-3"&gt;
                                            &lt;label class="form-label"&gt;Nouveau mot de passe *&lt;/label&gt;
                                            &lt;input type="password" class="form-control" id="newPassword" name="new_password" 
                                                   required minlength="8"&gt;
                                            &lt;small class="text-muted"&gt;Minimum 8 caractères&lt;/small&gt;
                                        &lt;/div&gt;
                                        &lt;div class="mb-3"&gt;
                                            &lt;label class="form-label"&gt;Confirmer le mot de passe *&lt;/label&gt;
                                            &lt;input type="password" class="form-control" id="confirmPassword" 
                                                   required minlength="8"&gt;
                                        &lt;/div&gt;
                                        &lt;button type="submit" class="btn btn-primary w-100"&gt;
                                            &lt;i class="fas fa-save"&gt;&lt;/i&gt; Changer le mot de passe
                                        &lt;/button&gt;
                                    &lt;/form&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                            
                            &lt;!-- Informations système --&gt;
                            &lt;div class="card mt-4"&gt;
                                &lt;div class="card-header"&gt;
                                    &lt;h5 class="mb-0"&gt;&lt;i class="fas fa-info-circle"&gt;&lt;/i&gt; Informations Système&lt;/h5&gt;
                                &lt;/div&gt;
                                &lt;div class="card-body"&gt;
                                    &lt;table class="table table-sm table-borderless"&gt;
                                        &lt;tr&gt;
                                            &lt;th&gt;Version:&lt;/th&gt;
                                            &lt;td&gt;1.0.0&lt;/td&gt;
                                        &lt;/tr&gt;
                                        &lt;tr&gt;
                                            &lt;th&gt;Technologie:&lt;/th&gt;
                                            &lt;td&gt;PHP / MySQL / Bootstrap&lt;/td&gt;
                                        &lt;/tr&gt;
                                        &lt;tr&gt;
                                            &lt;th&gt;Dernière mise à jour:&lt;/th&gt;
                                            &lt;td&gt;&lt;?php echo date('d/m/Y'); ?&gt;&lt;/td&gt;
                                        &lt;/tr&gt;
                                    &lt;/table&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;

&lt;script&gt;
// Validation du formulaire de mot de passe
document.getElementById('passwordForm').addEventListener('submit', function(e) {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        e.preventDefault();
        alert('Les mots de passe ne correspondent pas');
        return false;
    }
    
    return true;
});
&lt;/script&gt;
&lt;?php
$content = ob_get_clean();

require_once __DIR__ . '/../views/components/layout.php';
?&gt;