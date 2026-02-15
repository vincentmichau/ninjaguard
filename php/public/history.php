&lt;?php
/**
 * NightWatch - Historique des rapports
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
            &lt;div class="card fade-in"&gt;
                &lt;div class="card-header"&gt;
                    &lt;h4 class="mb-0"&gt;&lt;i class="fas fa-history"&gt;&lt;/i&gt; Historique des Rapports&lt;/h4&gt;
                &lt;/div&gt;
                &lt;div class="card-body"&gt;
                    &lt;!-- Filtres avancés --&gt;
                    &lt;div class="row mb-4"&gt;
                        &lt;div class="col-md-3"&gt;
                            &lt;label class="form-label"&gt;Date de début&lt;/label&gt;
                            &lt;input type="date" class="form-control" id="dateFrom" onchange="loadHistory()"&gt;
                        &lt;/div&gt;
                        &lt;div class="col-md-3"&gt;
                            &lt;label class="form-label"&gt;Date de fin&lt;/label&gt;
                            &lt;input type="date" class="form-control" id="dateTo" onchange="loadHistory()"&gt;
                        &lt;/div&gt;
                        &lt;div class="col-md-3"&gt;
                            &lt;label class="form-label"&gt;Statut&lt;/label&gt;
                            &lt;select class="form-select" id="filterStatus" onchange="loadHistory()"&gt;
                                &lt;option value=""&gt;Tous&lt;/option&gt;
                                &lt;option value="normal"&gt;Normal&lt;/option&gt;
                                &lt;option value="incident"&gt;Incident&lt;/option&gt;
                                &lt;option value="alerte"&gt;Alerte&lt;/option&gt;
                            &lt;/select&gt;
                        &lt;/div&gt;
                        &lt;div class="col-md-3"&gt;
                            &lt;label class="form-label"&gt;Validé&lt;/label&gt;
                            &lt;select class="form-select" id="filterValidated" onchange="loadHistory()"&gt;
                                &lt;option value=""&gt;Tous&lt;/option&gt;
                                &lt;option value="1"&gt;Validés&lt;/option&gt;
                                &lt;option value="0"&gt;Non validés&lt;/option&gt;
                            &lt;/select&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                    
                    &lt;!-- Tableau des rapports --&gt;
                    &lt;div class="table-responsive"&gt;
                        &lt;table class="table table-hover"&gt;
                            &lt;thead&gt;
                                &lt;tr&gt;
                                    &lt;th&gt;ID&lt;/th&gt;
                                    &lt;th&gt;Site&lt;/th&gt;
                                    &lt;th&gt;Date&lt;/th&gt;
                                    &lt;th&gt;Poste&lt;/th&gt;
                                    &lt;th&gt;Auteur&lt;/th&gt;
                                    &lt;th&gt;Statut&lt;/th&gt;
                                    &lt;th&gt;Validé&lt;/th&gt;
                                    &lt;th&gt;Créé le&lt;/th&gt;
                                    &lt;th&gt;Actions&lt;/th&gt;
                                &lt;/tr&gt;
                            &lt;/thead&gt;
                            &lt;tbody id="historyTable"&gt;
                                &lt;tr&gt;
                                    &lt;td colspan="9" class="text-center"&gt;
                                        &lt;div class="spinner-border text-primary" role="status"&gt;&lt;/div&gt;
                                    &lt;/td&gt;
                                &lt;/tr&gt;
                            &lt;/tbody&gt;
                        &lt;/table&gt;
                    &lt;/div&gt;
                    
                    &lt;!-- Pagination --&gt;
                    &lt;nav aria-label="Pagination" class="mt-4"&gt;
                        &lt;ul class="pagination justify-content-center" id="pagination"&gt;
                        &lt;/ul&gt;
                    &lt;/nav&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;

&lt;script&gt;
const API_URL = '/api';
let currentPage = 1;

// Charger l'historique
async function loadHistory(page = 1) {
    currentPage = page;
    const token = localStorage.getItem('token');
    
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const status = document.getElementById('filterStatus').value;
    const validated = document.getElementById('filterValidated').value;
    
    let url = `/reports?page=${page}&limit=50`;
    if (dateFrom) url += `&date_from=${dateFrom}`;
    if (dateTo) url += `&date_to=${dateTo}`;
    if (status) url += `&status=${status}`;
    if (validated) url += `&validated=${validated}`;
    
    try {
        const response = await fetch(API_URL + url, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayHistory(data.data);
            displayPagination(data.pagination);
        }
    } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
    }
}

// Afficher l'historique
function displayHistory(reports) {
    const tbody = document.getElementById('historyTable');
    
    if (reports.length === 0) {
        tbody.innerHTML = `
            &lt;tr&gt;
                &lt;td colspan="9" class="text-center text-muted"&gt;Aucun rapport trouvé pour cette période&lt;/td&gt;
            &lt;/tr&gt;
        `;
        return;
    }
    
    tbody.innerHTML = reports.map(report =&gt; {
        const statusClass = {
            'normal': 'success',
            'incident': 'warning',
            'alerte': 'danger'
        }[report.general_status] || 'secondary';
        
        return `
            &lt;tr&gt;
                &lt;td&gt;#${report.id}&lt;/td&gt;
                &lt;td&gt;
                    &lt;strong&gt;${report.site_name}&lt;/strong&gt;
                    &lt;br&gt;&lt;small class="text-muted"&gt;${report.client_name}&lt;/small&gt;
                &lt;/td&gt;
                &lt;td&gt;${new Date(report.report_date).toLocaleDateString('fr-FR')}&lt;/td&gt;
                &lt;td&gt;${report.shift_type}&lt;/td&gt;
                &lt;td&gt;${report.first_name} ${report.last_name}&lt;/td&gt;
                &lt;td&gt;&lt;span class="badge badge-${statusClass}"&gt;${report.general_status}&lt;/span&gt;&lt;/td&gt;
                &lt;td&gt;${report.is_validated ? '&lt;i class="fas fa-check-circle text-success"&gt;&lt;/i&gt; Oui' : '&lt;i class="fas fa-clock text-warning"&gt;&lt;/i&gt; Non'}&lt;/td&gt;
                &lt;td&gt;${new Date(report.created_at).toLocaleDateString('fr-FR')} ${new Date(report.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}&lt;/td&gt;
                &lt;td&gt;
                    &lt;a href="/report-view.php?id=${report.id}" class="btn btn-info btn-sm" title="Voir"&gt;
                        &lt;i class="fas fa-eye"&gt;&lt;/i&gt;
                    &lt;/a&gt;
                &lt;/td&gt;
            &lt;/tr&gt;
        `;
    }).join('');
}

// Afficher la pagination
function displayPagination(pagination) {
    const nav = document.getElementById('pagination');
    
    if (pagination.pages <= 1) {
        nav.innerHTML = '';
        return;
    }
    
    let html = '';
    
    html += `
        &lt;li class="page-item ${pagination.page === 1 ? 'disabled' : ''}"&gt;
            &lt;a class="page-link" href="#" onclick="loadHistory(${pagination.page - 1}); return false;"&gt;Précédent&lt;/a&gt;
        &lt;/li&gt;
    `;
    
    for (let i = 1; i <= pagination.pages; i++) {
        html += `
            &lt;li class="page-item ${i === pagination.page ? 'active' : ''}"&gt;
                &lt;a class="page-link" href="#" onclick="loadHistory(${i}); return false;"&gt;${i}&lt;/a&gt;
            &lt;/li&gt;
        `;
    }
    
    html += `
        &lt;li class="page-item ${pagination.page === pagination.pages ? 'disabled' : ''}"&gt;
            &lt;a class="page-link" href="#" onclick="loadHistory(${pagination.page + 1}); return false;"&gt;Suivant&lt;/a&gt;
        &lt;/li&gt;
    `;
    
    nav.innerHTML = html;
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
});
&lt;/script&gt;
&lt;?php
$content = ob_get_clean();

require_once __DIR__ . '/../views/components/layout.php';
?&gt;