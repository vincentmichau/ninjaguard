&lt;?php
/**
 * NightWatch - Formulaire de rapport
 */

session_start();

// Vérifier l'authentification
if (!isset($_SESSION['token'])) {
    header('Location: /login.php');
    exit();
}

$user = json_decode($_SESSION['user'], true);
$reportId = isset($_GET['id']) ? $_GET['id'] : null;

// Charger le layout
$content = ob_get_clean();

ob_start();
?&gt;
&lt;div class="container-fluid py-4"&gt;
    &lt;div class="row"&gt;
        &lt;div class="col-12"&gt;
            &lt;div class="card fade-in"&gt;
                &lt;div class="card-header"&gt;
                    &lt;h4 class="mb-0"&gt;
                        &lt;i class="fas fa-file-alt"&gt;&lt;/i&gt; 
                        &lt;?php echo $reportId ? 'Modifier le Rapport #' . $reportId : 'Nouveau Rapport'; ?&gt;
                    &lt;/h4&gt;
                &lt;/div&gt;
                &lt;div class="card-body"&gt;
                    &lt;form id="reportForm" data-action="/reports" data-method="POST" data-redirect="/reports.php"&gt;
                        &lt;input type="hidden" name="report_id" id="report_id" value="&lt;?php echo $reportId ?: ''; ?&gt;"&gt;
                        
                        &lt;!-- Informations générales --&gt;
                        &lt;div class="report-section"&gt;
                            &lt;h5&gt;&lt;i class="fas fa-info-circle"&gt;&lt;/i&gt; Informations Générales&lt;/h5&gt;
                            &lt;div class="row"&gt;
                                &lt;div class="col-md-6 mb-3"&gt;
                                    &lt;label class="form-label"&gt;Site *&lt;/label&gt;
                                    &lt;select class="form-select" name="site_id" id="site_id" required&gt;
                                        &lt;option value=""&gt;Sélectionner un site&lt;/option&gt;
                                    &lt;/select&gt;
                                &lt;/div&gt;
                                &lt;div class="col-md-6 mb-3"&gt;
                                    &lt;label class="form-label"&gt;Date du rapport *&lt;/label&gt;
                                    &lt;input type="date" class="form-control" name="report_date" id="report_date" required&gt;
                                &lt;/div&gt;
                                &lt;div class="col-md-6 mb-3"&gt;
                                    &lt;label class="form-label"&gt;Type de poste *&lt;/label&gt;
                                    &lt;select class="form-select" name="shift_type" id="shift_type" required&gt;
                                        &lt;option value=""&gt;Sélectionner&lt;/option&gt;
                                        &lt;option value="nuit"&gt;Nuit&lt;/option&gt;
                                        &lt;option value="matin"&gt;Matin&lt;/option&gt;
                                        &lt;option value="apres-midi"&gt;Après-midi&lt;/option&gt;
                                        &lt;option value="soir"&gt;Soir&lt;/option&gt;
                                    &lt;/select&gt;
                                &lt;/div&gt;
                                &lt;div class="col-md-3 mb-3"&gt;
                                    &lt;label class="form-label"&gt;Heure de début *&lt;/label&gt;
                                    &lt;input type="datetime-local" class="form-control" name="start_time" id="start_time" required&gt;
                                &lt;/div&gt;
                                &lt;div class="col-md-3 mb-3"&gt;
                                    &lt;label class="form-label"&gt;Heure de fin&lt;/label&gt;
                                    &lt;input type="datetime-local" class="form-control" name="end_time" id="end_time"&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                        
                        &lt;!-- Conditions météo --&gt;
                        &lt;div class="report-section"&gt;
                            &lt;h5&gt;&lt;i class="fas fa-cloud-sun"&gt;&lt;/i&gt; Conditions Météo&lt;/h5&gt;
                            &lt;div class="row"&gt;
                                &lt;div class="col-md-6 mb-3"&gt;
                                    &lt;label class="form-label"&gt;Météo&lt;/label&gt;
                                    &lt;select class="form-select" name="weather" id="weather"&gt;
                                        &lt;option value=""&gt;Non spécifié&lt;/option&gt;
                                        &lt;option value="ensoleille"&gt;Ensoleillé&lt;/option&gt;
                                        &lt;option value="nuageux"&gt;Nuageux&lt;/option&gt;
                                        &lt;option value="pluvieux"&gt;Pluvieux&lt;/option&gt;
                                        &lt;option value="neige"&gt;Neige&lt;/option&gt;
                                        &lt;option value="brouillard"&gt;Brouillard&lt;/option&gt;
                                        &lt;option value="orage"&gt;Orage&lt;/option&gt;
                                    &lt;/select&gt;
                                &lt;/div&gt;
                                &lt;div class="col-md-6 mb-3"&gt;
                                    &lt;label class="form-label"&gt;Température (°C)&lt;/label&gt;
                                    &lt;input type="number" class="form-control" name="temperature" id="temperature" 
                                           min="-20" max="50" placeholder="Ex: 15"&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                        
                        &lt;!-- Statut général --&gt;
                        &lt;div class="report-section"&gt;
                            &lt;h5&gt;&lt;i class="fas fa-clipboard-check"&gt;&lt;/i&gt; Statut Général&lt;/h5&gt;
                            &lt;div class="row"&gt;
                                &lt;div class="col-md-6 mb-3"&gt;
                                    &lt;label class="form-label"&gt;Statut *&lt;/label&gt;
                                    &lt;select class="form-select" name="general_status" id="general_status" required&gt;
                                        &lt;option value="normal"&gt;Normal&lt;/option&gt;
                                        &lt;option value="incident"&gt;Incident&lt;/option&gt;
                                        &lt;option value="alerte"&gt;Alerte&lt;/option&gt;
                                    &lt;/select&gt;
                                &lt;/div&gt;
                                &lt;div class="col-md-6 mb-3"&gt;
                                    &lt;label class="form-label"&gt;Photos&lt;/label&gt;
                                    &lt;input type="file" class="form-control" name="photos" id="photos" multiple accept="image/*"&gt;
                                    &lt;small class="text-muted"&gt;Formats acceptés: JPG, PNG, WEBP (max 5 Mo)&lt;/small&gt;
                                &lt;/div&gt;
                                &lt;div class="col-12 mb-3"&gt;
                                    &lt;label class="form-label"&gt;Notes générales&lt;/label&gt;
                                    &lt;textarea class="form-control" name="general_notes" id="general_notes" rows="4" 
                                              placeholder="Ajoutez vos observations générales ici..."&gt;&lt;/textarea&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                        
                        &lt;!-- Événements --&gt;
                        &lt;div class="report-section"&gt;
                            &lt;h5&gt;&lt;i class="fas fa-exclamation-circle"&gt;&lt;/i&gt; Événements / Incidents&lt;/h5&gt;
                            &lt;div id="eventsContainer"&gt;
                                &lt;div class="event-item card p-3 mb-3"&gt;
                                    &lt;div class="row"&gt;
                                        &lt;div class="col-md-4 mb-2"&gt;
                                            &lt;label class="form-label"&gt;Type *&lt;/label&gt;
                                            &lt;select class="form-select event-type" required&gt;
                                                &lt;option value="incident"&gt;Incident&lt;/option&gt;
                                                &lt;option value="observation"&gt;Observation&lt;/option&gt;
                                                &lt;option value="intervention"&gt;Intervention&lt;/option&gt;
                                                &lt;option value="autre"&gt;Autre&lt;/option&gt;
                                            &lt;/select&gt;
                                        &lt;/div&gt;
                                        &lt;div class="col-md-4 mb-2"&gt;
                                            &lt;label class="form-label"&gt;Titre *&lt;/label&gt;
                                            &lt;input type="text" class="form-control event-title" required placeholder="Titre de l'événement"&gt;
                                        &lt;/div&gt;
                                        &lt;div class="col-md-2 mb-2"&gt;
                                            &lt;label class="form-label"&gt;Gravité&lt;/label&gt;
                                            &lt;select class="form-select event-severity"&gt;
                                                &lt;option value="faible"&gt;Faible&lt;/option&gt;
                                                &lt;option value="moyen" selected&gt;Moyen&lt;/option&gt;
                                                &lt;option value="eleve"&gt;Élevé&lt;/option&gt;
                                                &lt;option value="critique"&gt;Critique&lt;/option&gt;
                                            &lt;/select&gt;
                                        &lt;/div&gt;
                                        &lt;div class="col-md-2 mb-2"&gt;
                                            &lt;label class="form-label"&gt;Heure *&lt;/label&gt;
                                            &lt;input type="datetime-local" class="form-control event-occurred-at" required&gt;
                                        &lt;/div&gt;
                                        &lt;div class="col-12 mb-2"&gt;
                                            &lt;label class="form-label"&gt;Description&lt;/label&gt;
                                            &lt;textarea class="form-control event-description" rows="3" 
                                                      placeholder="Description détaillée de l'événement..."&gt;&lt;/textarea&gt;
                                        &lt;/div&gt;
                                    &lt;/div&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                            &lt;button type="button" class="btn btn-secondary" onclick="addEvent()"&gt;
                                &lt;i class="fas fa-plus"&gt;&lt;/i&gt; Ajouter un événement
                            &lt;/button&gt;
                        &lt;/div&gt;
                        
                        &lt;!-- Boutons d'action --&gt;
                        &lt;div class="row mt-4"&gt;
                            &lt;div class="col-12"&gt;
                                &lt;button type="submit" class="btn btn-primary btn-lg"&gt;
                                    &lt;i class="fas fa-save"&gt;&lt;/i&gt; Enregistrer le rapport
                                &lt;/button&gt;
                                &lt;a href="/reports.php" class="btn btn-secondary btn-lg ms-2"&gt;
                                    &lt;i class="fas fa-times"&gt;&lt;/i&gt; Annuler
                                &lt;/a&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/form&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;

&lt;script&gt;
const API_URL = '/api';

// Ajouter un événement
function addEvent() {
    const container = document.getElementById('eventsContainer');
    const template = container.querySelector('.event-item').cloneNode(true);
    
    // Réinitialiser les champs
    template.querySelectorAll('input, textarea').forEach(input =&gt; {
        input.value = '';
    });
    template.querySelector('.event-occurred-at').value = new Date().toISOString().slice(0, 16);
    
    container.appendChild(template);
}

// Charger les sites
async function loadSites() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(API_URL + '/admin/sites', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('site_id');
            data.data.forEach(site =&gt; {
                select.innerHTML += `&lt;option value="${site.id}"&gt;${site.name} (${site.client_name})&lt;/option&gt;`;
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des sites:', error);
    }
}

// Charger un rapport existant
async function loadReport(reportId) {
    if (!reportId) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(API_URL + `/reports/${reportId}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const report = data.data;
            
            // Remplir le formulaire
            document.getElementById('site_id').value = report.site_id;
            document.getElementById('report_date').value = report.report_date;
            document.getElementById('shift_type').value = report.shift_type;
            document.getElementById('start_time').value = report.start_time;
            document.getElementById('end_time').value = report.end_time || '';
            document.getElementById('weather').value = report.weather || '';
            document.getElementById('temperature').value = report.temperature || '';
            document.getElementById('general_status').value = report.general_status;
            document.getElementById('general_notes').value = report.general_notes || '';
            
            // Mettre à jour l'action du formulaire
            const form = document.getElementById('reportForm');
            form.dataset.action = `/reports/${reportId}`;
            form.dataset.method = 'PUT';
            
            // Charger les événements
            if (report.events && report.events.length > 0) {
                const container = document.getElementById('eventsContainer');
                container.innerHTML = '';
                
                report.events.forEach(event =&gt; {
                    const template = `
                        &lt;div class="event-item card p-3 mb-3"&gt;
                            &lt;div class="row"&gt;
                                &lt;div class="col-md-4 mb-2"&gt;
                                    &lt;label class="form-label"&gt;Type *&lt;/label&gt;
                                    &lt;select class="form-select event-type" required&gt;
                                        &lt;option value="incident" ${event.type === 'incident' ? 'selected' : ''}&gt;Incident&lt;/option&gt;
                                        &lt;option value="observation" ${event.type === 'observation' ? 'selected' : ''}&gt;Observation&lt;/option&gt;
                                        &lt;option value="intervention" ${event.type === 'intervention' ? 'selected' : ''}&gt;Intervention&lt;/option&gt;
                                        &lt;option value="autre" ${event.type === 'autre' ? 'selected' : ''}&gt;Autre&lt;/option&gt;
                                    &lt;/select&gt;
                                &lt;/div&gt;
                                &lt;div class="col-md-4 mb-2"&gt;
                                    &lt;label class="form-label"&gt;Titre *&lt;/label&gt;
                                    &lt;input type="text" class="form-control event-title" required value="${event.title}"&gt;
                                &lt;/div&gt;
                                &lt;div class="col-md-2 mb-2"&gt;
                                    &lt;label class="form-label"&gt;Gravité&lt;/label&gt;
                                    &lt;select class="form-select event-severity"&gt;
                                        &lt;option value="faible" ${event.severity === 'faible' ? 'selected' : ''}&gt;Faible&lt;/option&gt;
                                        &lt;option value="moyen" ${event.severity === 'moyen' ? 'selected' : ''}&gt;Moyen&lt;/option&gt;
                                        &lt;option value="eleve" ${event.severity === 'eleve' ? 'selected' : ''}&gt;Élevé&lt;/option&gt;
                                        &lt;option value="critique" ${event.severity === 'critique' ? 'selected' : ''}&gt;Critique&lt;/option&gt;
                                    &lt;/select&gt;
                                &lt;/div&gt;
                                &lt;div class="col-md-2 mb-2"&gt;
                                    &lt;label class="form-label"&gt;Heure *&lt;/label&gt;
                                    &lt;input type="datetime-local" class="form-control event-occurred-at" required 
                                           value="${event.occurred_at}"&gt;
                                &lt;/div&gt;
                                &lt;div class="col-12 mb-2"&gt;
                                    &lt;label class="form-label"&gt;Description&lt;/label&gt;
                                    &lt;textarea class="form-control event-description" rows="3"&gt;${event.description || ''}&lt;/textarea&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    `;
                    container.innerHTML += template;
                });
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement du rapport:', error);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadSites();
    
    // Définir la date par défaut
    document.getElementById('report_date').value = new Date().toISOString().split('T')[0];
    document.getElementById('start_time').value = new Date().toISOString().slice(0, 16);
    
    // Charger le rapport si on est en modification
    const reportId = document.getElementById('report_id').value;
    if (reportId) {
        loadReport(reportId);
    }
});
&lt;/script&gt;
&lt;?php
$content = ob_get_clean();

require_once __DIR__ . '/../views/components/layout.php';
?&gt;