&lt;?php
/**
 * NightWatch - Tableau de bord
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
    &lt;div class="row"&gt;
        &lt;div class="col-12"&gt;
            &lt;div class="dashboard-welcome fade-in"&gt;
                &lt;h1&gt;&lt;i class="fas fa-tachometer-alt"&gt;&lt;/i&gt; Bienvenue, &lt;?php echo htmlspecialchars($user['first_name']); ?&gt;!&lt;/h1&gt;
                &lt;p class="mb-0"&gt;Voici un aperçu de votre activité sur NightWatch&lt;/p&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    
    &lt;div class="row g-4"&gt;
        &lt;!-- Statistiques --&gt;
        &lt;div class="col-md-3"&gt;
            &lt;div class="card stat-card fade-in"&gt;
                &lt;div class="stat-icon text-primary"&gt;
                    &lt;i class="fas fa-file-alt"&gt;&lt;/i&gt;
                &lt;/div&gt;
                &lt;div class="stat-value" id="totalReports"&gt;-&lt;/div&gt;
                &lt;div class="stat-label"&gt;Total Rapports&lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
        
        &lt;div class="col-md-3"&gt;
            &lt;div class="card stat-card fade-in"&gt;
                &lt;div class="stat-icon text-success"&gt;
                    &lt;i class="fas fa-check-circle"&gt;&lt;/i&gt;
                &lt;/div&gt;
                &lt;div class="stat-value" id="validatedReports"&gt;-&lt;/div&gt;
                &lt;div class="stat-label"&gt;Rapports Validés&lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
        
        &lt;div class="col-md-3"&gt;
            &lt;div class="card stat-card fade-in"&gt;
                &lt;div class="stat-icon text-warning"&gt;
                    &lt;i class="fas fa-exclamation-triangle"&gt;&lt;/i&gt;
                &lt;/div&gt;
                &lt;div class="stat-value" id="incidents"&gt;-&lt;/div&gt;
                &lt;div class="stat-label"&gt;Incidents&lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
        
        &lt;div class="col-md-3"&gt;
            &lt;div class="card stat-card fade-in"&gt;
                &lt;div class="stat-icon text-danger"&gt;
                    &lt;i class="fas fa-bell"&gt;&lt;/i&gt;
                &lt;/div&gt;
                &lt;div class="stat-value" id="alerts"&gt;-&lt;/div&gt;
                &lt;div class="stat-label"&gt;Alertes&lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    
    &lt;div class="row g-4 mt-2"&gt;
        &lt;!-- Actions rapides --&gt;
        &lt;div class="col-md-6"&gt;
            &lt;div class="card fade-in"&gt;
                &lt;div class="card-header"&gt;
                    &lt;i class="fas fa-bolt"&gt;&lt;/i&gt; Actions Rapides
                &lt;/div&gt;
                &lt;div class="card-body"&gt;
                    &lt;div class="d-grid gap-3"&gt;
                        &lt;a href="/report-form.php" class="btn btn-primary btn-lg"&gt;
                            &lt;i class="fas fa-plus-circle"&gt;&lt;/i&gt; Créer un nouveau rapport
                        &lt;/a&gt;
                        &lt;a href="/reports.php" class="btn btn-info btn-lg"&gt;
                            &lt;i class="fas fa-list"&gt;&lt;/i&gt; Voir tous les rapports
                        &lt;/a&gt;
                        &lt;a href="/history.php" class="btn btn-secondary btn-lg"&gt;
                            &lt;i class="fas fa-history"&gt;&lt;/i&gt; Consulter l'historique
                        &lt;/a&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
        
        &lt;!-- Rapports récents --&gt;
        &lt;div class="col-md-6"&gt;
            &lt;div class="card fade-in"&gt;
                &lt;div class="card-header"&gt;
                    &lt;i class="fas fa-clock"&gt;&lt;/i&gt; Rapports Récents
                &lt;/div&gt;
                &lt;div class="card-body"&gt;
                    &lt;div class="table-responsive"&gt;
                        &lt;table class="table table-hover"&gt;
                            &lt;thead&gt;
                                &lt;tr&gt;
                                    &lt;th&gt;Site&lt;/th&gt;
                                    &lt;th&gt;Date&lt;/th&gt;
                                    &lt;th&gt;Statut&lt;/th&gt;
                                &lt;/tr&gt;
                            &lt;/thead&gt;
                            &lt;tbody id="recentReports"&gt;
                                &lt;tr&gt;
                                    &lt;td colspan="3" class="text-center"&gt;
                                        &lt;div class="spinner-border text-primary" role="status"&gt;&lt;/div&gt;
                                    &lt;/td&gt;
                                &lt;/tr&gt;
                            &lt;/tbody&gt;
                        &lt;/table&gt;
                    &lt;/div&gt;
                    &lt;a href="/reports.php" class="btn btn-outline-primary w-100 mt-3"&gt;
                        Voir tous les rapports &lt;i class="fas fa-arrow-right"&gt;&lt;/i&gt;
                    &lt;/a&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;

&lt;script&gt;
const API_URL = '/api';

// Charger les statistiques
async function loadStats() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(API_URL + '/reports/stats', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalReports').textContent = data.data.total || 0;
            document.getElementById('validatedReports').textContent = data.data.validated || 0;
            document.getElementById('incidents').textContent = data.data.incidents || 0;
            document.getElementById('alerts').textContent = data.data.alerts || 0;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

// Charger les rapports récents
async function loadRecentReports() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(API_URL + '/reports?limit=5', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const tbody = document.getElementById('recentReports');
            tbody.innerHTML = '';
            
            data.data.forEach(report => {
                const statusClass = report.is_validated ? 'success' : 'warning';
                const statusText = report.is_validated ? 'Validé' : 'En attente';
                
                tbody.innerHTML += `
                    &lt;tr&gt;
                        &lt;td&gt;${report.site_name}&lt;/td&gt;
                        &lt;td&gt;${new Date(report.report_date).toLocaleDateString('fr-FR')}&lt;/td&gt;
                        &lt;td&gt;&lt;span class="badge badge-${statusClass}"&gt;${statusText}&lt;/span&gt;&lt;/td&gt;
                    &lt;/tr&gt;
                `;
            });
        } else {
            document.getElementById('recentReports').innerHTML = `
                &lt;tr&gt;
                    &lt;td colspan="3" class="text-center text-muted"&gt;Aucun rapport récent&lt;/td&gt;
                &lt;/tr&gt;
            `;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des rapports récents:', error);
    }
}

// Charger les données au démarrage
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    loadRecentReports();
});
&lt;/script&gt;
&lt;?php
$content = ob_get_clean();

require_once __DIR__ . '/../views/components/layout.php';
?&gt;