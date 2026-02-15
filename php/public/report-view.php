&lt;?php
/**
 * NightWatch - Détail d'un rapport
 */

session_start();

// Vérifier l'authentification
if (!isset($_SESSION['token'])) {
    header('Location: /login.php');
    exit();
}

$reportId = isset($_GET['id']) ? $_GET['id'] : null;

if (!$reportId) {
    header('Location: /reports.php');
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
            &lt;div class="card fade-in"&gt;
                &lt;div class="card-header d-flex justify-content-between align-items-center"&gt;
                    &lt;h4 class="mb-0"&gt;&lt;i class="fas fa-file-alt"&gt;&lt;/i&gt; Détail du Rapport #&lt;?php echo $reportId; ?&gt;&lt;/h4&gt;
                    &lt;div&gt;
                        &lt;a href="/reports.php" class="btn btn-secondary"&gt;
                            &lt;i class="fas fa-arrow-left"&gt;&lt;/i&gt; Retour
                        &lt;/a&gt;
                        &lt;a href="/report-form.php?id=&lt;?php echo $reportId; ?&gt;" class="btn btn-primary" id="btnEdit"&gt;
                            &lt;i class="fas fa-edit"&gt;&lt;/i&gt; Modifier
                        &lt;/a&gt;
                        &lt;button class="btn btn-success" onclick="validateReport()" id="btnValidate"&gt;
                            &lt;i class="fas fa-check-circle"&gt;&lt;/i&gt; Valider
                        &lt;/button&gt;
                        &lt;button class="btn btn-danger" onclick="generatePDF()"&gt;
                            &lt;i class="fas fa-file-pdf"&gt;&lt;/i&gt; PDF
                        &lt;/button&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
                &lt;div class="card-body" id="reportContent"&gt;
                    &lt;div class="text-center py-5"&gt;
                        &lt;div class="spinner-border text-primary" role="status"&gt;&lt;/div&gt;
                        &lt;p class="mt-3"&gt;Chargement du rapport...&lt;/p&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;

&lt;script&gt;
const API_URL = '/api';
const reportId = &lt;?php echo $reportId; ?&gt;;

// Charger le rapport
async function loadReport() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(API_URL + `/reports/${reportId}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayReport(data.data);
        } else {
            document.getElementById('reportContent').innerHTML = `
                &lt;div class="alert alert-danger"&gt;
                    &lt;i class="fas fa-exclamation-triangle"&gt;&lt;/i&gt; 
                    ${data.message || 'Erreur lors du chargement du rapport'}
                &lt;/div&gt;
            `;
        }
    } catch (error) {
        document.getElementById('reportContent').innerHTML = `
            &lt;div class="alert alert-danger"&gt;
                &lt;i class="fas fa-exclamation-triangle"&gt;&lt;/i&gt; 
                Erreur de connexion au serveur
            &lt;/div&gt;
        `;
    }
}

// Afficher le rapport
function displayReport(report) {
    const content = document.getElementById('reportContent');
    
    // Gérer les boutons selon le statut
    if (report.is_validated) {
        document.getElementById('btnEdit').style.display = 'none';
        document.getElementById('btnValidate').style.display = 'none';
    }
    
    // Statut du rapport
    const statusClass = {
        'normal': 'success',
        'incident': 'warning',
        'alerte': 'danger'
    }[report.general_status] || 'secondary';
    
    content.innerHTML = `
        &lt;div class="row"&gt;
            &lt;!-- Informations générales --&gt;
            &lt;div class="col-md-6"&gt;
                &lt;div class="card mb-4"&gt;
                    &lt;div class="card-header"&gt;
                        &lt;h5 class="mb-0"&gt;&lt;i class="fas fa-info-circle"&gt;&lt;/i&gt; Informations Générales&lt;/h5&gt;
                    &lt;/div&gt;
                    &lt;div class="card-body"&gt;
                        &lt;table class="table table-borderless"&gt;
                            &lt;tr&gt;
                                &lt;th&gt;Site:&lt;/th&gt;
                                &lt;td&gt;&lt;strong&gt;${report.site_name}&lt;/strong&gt;&lt;/td&gt;
                            &lt;/tr&gt;
                            &lt;tr&gt;
                                &lt;th&gt;Client:&lt;/th&gt;
                                &lt;td&gt;${report.client_name}&lt;/td&gt;
                            &lt;/tr&gt;
                            &lt;tr&gt;
                                &lt;th&gt;Adresse:&lt;/th&gt;
                                &lt;td&gt;${report.site_address}&lt;/td&gt;
                            &lt;/tr&gt;
                            &lt;tr&gt;
                                &lt;th&gt;Date:&lt;/th&gt;
                                &lt;td&gt;${new Date(report.report_date).toLocaleDateString('fr-FR')}&lt;/td&gt;
                            &lt;/tr&gt;
                            &lt;tr&gt;
                                &lt;th&gt;Poste:&lt;/th&gt;
                                &lt;td&gt;${report.shift_type}&lt;/td&gt;
                            &lt;/tr&gt;
                            &lt;tr&gt;
                                &lt;th&gt;Début:&lt;/th&gt;
                                &lt;td&gt;${new Date(report.start_time).toLocaleString('fr-FR')}&lt;/td&gt;
                            &lt;/tr&gt;
                            &lt;tr&gt;
                                &lt;th&gt;Fin:&lt;/th&gt;
                                &lt;td&gt;${report.end_time ? new Date(report.end_time).toLocaleString('fr-FR') : 'En cours'}&lt;/td&gt;
                            &lt;/tr&gt;
                        &lt;/table&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            
            &lt;!-- Informations agent --&gt;
            &lt;div class="col-md-6"&gt;
                &lt;div class="card mb-4"&gt;
                    &lt;div class="card-header"&gt;
                        &lt;h5 class="mb-0"&gt;&lt;i class="fas fa-user"&gt;&lt;/i&gt; Agent&lt;/h5&gt;
                    &lt;/div&gt;
                    &lt;div class="card-body"&gt;
                        &lt;table class="table table-borderless"&gt;
                            &lt;tr&gt;
                                &lt;th&gt;Nom:&lt;/th&gt;
                                &lt;td&gt;&lt;strong&gt;${report.first_name} ${report.last_name}&lt;/strong&gt;&lt;/td&gt;
                            &lt;/tr&gt;
                            &lt;tr&gt;
                                &lt;th&gt;Email:&lt;/th&gt;
                                &lt;td&gt;${report.email}&lt;/td&gt;
                            &lt;/tr&gt;
                            &lt;tr&gt;
                                &lt;th&gt;Statut:&lt;/th&gt;
                                &lt;td&gt;&lt;span class="badge badge-${statusClass}"&gt;${report.general_status}&lt;/span&gt;&lt;/td&gt;
                            &lt;/tr&gt;
                            &lt;tr&gt;
                                &lt;th&gt;Validé:&lt;/th&gt;
                                &lt;td&gt;${report.is_validated ? '&lt;i class="fas fa-check-circle text-success"&gt;&lt;/i&gt; Oui' : '&lt;i class="fas fa-clock text-warning"&gt;&lt;/i&gt; Non'}&lt;/td&gt;
                            &lt;/tr&gt;
                            ${report.validated_at ? `
                            &lt;tr&gt;
                                &lt;th&gt;Validé par:&lt;/th&gt;
                                &lt;td&gt;${report.validator_first_name} ${report.validator_last_name}&lt;/td&gt;
                            &lt;/tr&gt;
                            &lt;tr&gt;
                                &lt;th&gt;Le:&lt;/th&gt;
                                &lt;td&gt;${new Date(report.validated_at).toLocaleString('fr-FR')}&lt;/td&gt;
                            &lt;/tr&gt;
                            ` : ''}
                        &lt;/table&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            
            &lt;!-- Conditions météo --&gt;
            &lt;div class="col-md-6"&gt;
                &lt;div class="card mb-4"&gt;
                    &lt;div class="card-header"&gt;
                        &lt;h5 class="mb-0"&gt;&lt;i class="fas fa-cloud-sun"&gt;&lt;/i&gt; Conditions Météo&lt;/h5&gt;
                    &lt;/div&gt;
                    &lt;div class="card-body"&gt;
                        &lt;table class="table table-borderless"&gt;
                            &lt;tr&gt;
                                &lt;th&gt;Météo:&lt;/th&gt;
                                &lt;td&gt;${report.weather ? report.weather.charAt(0).toUpperCase() + report.weather.slice(1) : 'Non spécifié'}&lt;/td&gt;
                            &lt;/tr&gt;
                            &lt;tr&gt;
                                &lt;th&gt;Température:&lt;/th&gt;
                                &lt;td&gt;${report.temperature ? report.temperature + '°C' : 'Non spécifiée'}&lt;/td&gt;
                            &lt;/tr&gt;
                        &lt;/table&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            
            &lt;!-- Photos --&gt;
            &lt;div class="col-md-6"&gt;
                &lt;div class="card mb-4"&gt;
                    &lt;div class="card-header"&gt;
                        &lt;h5 class="mb-0"&gt;&lt;i class="fas fa-images"&gt;&lt;/i&gt; Photos&lt;/h5&gt;
                    &lt;/div&gt;
                    &lt;div class="card-body"&gt;
                        ${report.photos && report.photos.length > 0 ? `
                            &lt;div class="row"&gt;
                                ${report.photos.map(photo =&gt; `
                                    &lt;div class="col-md-6 mb-3"&gt;
                                        &lt;img src="${photo}" alt="Photo" class="img-fluid rounded" 
                                             style="max-height: 200px; width: 100%; object-fit: cover;"&gt;
                                    &lt;/div&gt;
                                `).join('')}
                            &lt;/div&gt;
                        ` : '&lt;p class="text-muted"&gt;Aucune photo&lt;/p&gt;'}
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            
            &lt;!-- Notes générales --&gt;
            &lt;div class="col-12"&gt;
                &lt;div class="card mb-4"&gt;
                    &lt;div class="card-header"&gt;
                        &lt;h5 class="mb-0"&gt;&lt;i class="fas fa-clipboard"&gt;&lt;/i&gt; Notes Générales&lt;/h5&gt;
                    &lt;/div&gt;
                    &lt;div class="card-body"&gt;
                        ${report.general_notes ? `
                            &lt;p&gt;${report.general_notes}&lt;/p&gt;
                        ` : '&lt;p class="text-muted"&gt;Aucune note&lt;/p&gt;'}
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            
            &lt;!-- Événements --&gt;
            &lt;div class="col-12"&gt;
                &lt;div class="card mb-4"&gt;
                    &lt;div class="card-header"&gt;
                        &lt;h5 class="mb-0"&gt;&lt;i class="fas fa-exclamation-circle"&gt;&lt;/i&gt; Événements / Incidents&lt;/h5&gt;
                    &lt;/div&gt;
                    &lt;div class="card-body"&gt;
                        ${report.events && report.events.length > 0 ? `
                            &lt;div class="row"&gt;
                                ${report.events.map(event =&gt; `
                                    &lt;div class="col-md-6 mb-3"&gt;
                                        &lt;div class="event-card ${event.type}"&gt;
                                            &lt;div class="d-flex justify-content-between align-items-start"&gt;
                                                &lt;h6 class="mb-2"&gt;
                                                    &lt;i class="fas fa-${event.type === 'incident' ? 'exclamation-triangle' : event.type === 'observation' ? 'eye' : 'tools'}"&gt;&lt;/i&gt;
                                                    ${event.title}
                                                &lt;/h6&gt;
                                                &lt;span class="badge badge-${event.severity === 'critique' ? 'danger' : event.severity === 'eleve' ? 'warning' : 'info'}"&gt;
                                                    ${event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
                                                &lt;/span&gt;
                                            &lt;/div&gt;
                                            &lt;p class="mb-1 text-muted small"&gt;
                                                &lt;i class="fas fa-clock"&gt;&lt;/i&gt; ${new Date(event.occurred_at).toLocaleString('fr-FR')}
                                            &lt;/p&gt;
                                            ${event.description ? `&lt;p class="mb-0"&gt;${event.description}&lt;/p&gt;` : ''}
                                        &lt;/div&gt;
                                    &lt;/div&gt;
                                `).join('')}
                            &lt;/div&gt;
                        ` : '&lt;p class="text-muted"&gt;Aucun événement&lt;/p&gt;'}
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            
            &lt;!-- Informations système --&gt;
            &lt;div class="col-12"&gt;
                &lt;div class="card"&gt;
                    &lt;div class="card-body"&gt;
                        &lt;small class="text-muted"&gt;
                            &lt;i class="fas fa-clock"&gt;&lt;/i&gt; Créé le: ${new Date(report.created_at).toLocaleString('fr-FR')} | 
                            &lt;i class="fas fa-edit"&gt;&lt;/i&gt; Modifié le: ${new Date(report.updated_at).toLocaleString('fr-FR')}
                        &lt;/small&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    `;
}

// Valider le rapport
async function validateReport() {
    if (!confirm('Êtes-vous sûr de vouloir valider ce rapport ? Cette action est irréversible.')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(API_URL + `/reports/${reportId}/validate`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Rapport validé avec succès');
            loadReport();
        } else {
            alert(data.message || 'Erreur lors de la validation');
        }
    } catch (error) {
        alert('Erreur de connexion au serveur');
        console.error(error);
    }
}

// Générer PDF
function generatePDF() {
    alert('La fonctionnalité PDF sera bientôt disponible');
}

// Charger le rapport au démarrage
document.addEventListener('DOMContentLoaded', function() {
    loadReport();
});
&lt;/script&gt;
&lt;?php
$content = ob_get_clean();

require_once __DIR__ . '/../views/components/layout.php';
?&gt;