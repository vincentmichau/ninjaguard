&lt;?php
/**
 * NightWatch - Planification des rondes
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
                &lt;div class="card-header d-flex justify-content-between align-items-center"&gt;
                    &lt;h4 class="mb-0"&gt;&lt;i class="fas fa-calendar-alt"&gt;&lt;/i&gt; Planification&lt;/h4&gt;
                    &lt;div&gt;
                        &lt;button class="btn btn-success" onclick="exportICal()"&gt;
                            &lt;i class="fas fa-download"&gt;&lt;/i&gt; Exporter iCal
                        &lt;/button&gt;
                        &lt;button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addRoundModal"&gt;
                            &lt;i class="fas fa-plus"&gt;&lt;/i&gt; Ajouter une ronde
                        &lt;/button&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
                &lt;div class="card-body"&gt;
                    &lt;!-- Calendrier mensuel --&gt;
                    &lt;div class="row mb-4"&gt;
                        &lt;div class="col-12"&gt;
                            &lt;div class="card"&gt;
                                &lt;div class="card-header d-flex justify-content-between align-items-center"&gt;
                                    &lt;h5 class="mb-0" id="currentMonth"&gt;&lt;/h5&gt;
                                    &lt;div&gt;
                                        &lt;button class="btn btn-sm btn-outline-primary" onclick="previousMonth()"&gt;
                                            &lt;i class="fas fa-chevron-left"&gt;&lt;/i&gt;
                                        &lt;/button&gt;
                                        &lt;button class="btn btn-sm btn-outline-primary ms-2" onclick="nextMonth()"&gt;
                                            &lt;i class="fas fa-chevron-right"&gt;&lt;/i&gt;
                                        &lt;/button&gt;
                                    &lt;/div&gt;
                                &lt;/div&gt;
                                &lt;div class="card-body"&gt;
                                    &lt;div class="table-responsive"&gt;
                                        &lt;table class="table table-bordered calendar-table"&gt;
                                            &lt;thead&gt;
                                                &lt;tr&gt;
                                                    &lt;th class="text-center"&gt;Dim&lt;/th&gt;
                                                    &lt;th class="text-center"&gt;Lun&lt;/th&gt;
                                                    &lt;th class="text-center"&gt;Mar&lt;/th&gt;
                                                    &lt;th class="text-center"&gt;Mer&lt;/th&gt;
                                                    &lt;th class="text-center"&gt;Jeu&lt;/th&gt;
                                                    &lt;th class="text-center"&gt;Ven&lt;/th&gt;
                                                    &lt;th class="text-center"&gt;Sam&lt;/th&gt;
                                                &lt;/tr&gt;
                                            &lt;/thead&gt;
                                            &lt;tbody id="calendarBody"&gt;
                                            &lt;/tbody&gt;
                                        &lt;/table&gt;
                                    &lt;/div&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                    
                    &lt;!-- Liste des rondes du mois --&gt;
                    &lt;div class="row"&gt;
                        &lt;div class="col-12"&gt;
                            &lt;div class="card"&gt;
                                &lt;div class="card-header"&gt;
                                    &lt;h5 class="mb-0"&gt;&lt;i class="fas fa-list"&gt;&lt;/i&gt; Rondes du mois&lt;/h5&gt;
                                &lt;/div&gt;
                                &lt;div class="card-body"&gt;
                                    &lt;div class="table-responsive"&gt;
                                        &lt;table class="table table-hover"&gt;
                                            &lt;thead&gt;
                                                &lt;tr&gt;
                                                    &lt;th&gt;Date&lt;/th&gt;
                                                    &lt;th&gt;Site&lt;/th&gt;
                                                    &lt;th&gt;Heure&lt;/th&gt;
                                                    &lt;th&gt;Agent&lt;/th&gt;
                                                    &lt;th&gt;Statut&lt;/th&gt;
                                                    &lt;th&gt;Actions&lt;/th&gt;
                                                &lt;/tr&gt;
                                            &lt;/thead&gt;
                                            &lt;tbody id="roundsList"&gt;
                                                &lt;tr&gt;
                                                    &lt;td colspan="6" class="text-center"&gt;
                                                        &lt;div class="spinner-border text-primary" role="status"&gt;&lt;/div&gt;
                                                    &lt;/td&gt;
                                                &lt;/tr&gt;
                                            &lt;/tbody&gt;
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
&lt;/div&gt;

&lt;!-- Modal ajouter ronde --&gt;
&lt;div class="modal fade" id="addRoundModal" tabindex="-1"&gt;
    &lt;div class="modal-dialog"&gt;
        &lt;div class="modal-content"&gt;
            &lt;div class="modal-header"&gt;
                &lt;h5 class="modal-title"&gt;Ajouter une Ronde&lt;/h5&gt;
                &lt;button type="button" class="btn-close" data-bs-dismiss="modal"&gt;&lt;/button&gt;
            &lt;/div&gt;
            &lt;div class="modal-body"&gt;
                &lt;form id="roundForm"&gt;
                    &lt;div class="mb-3"&gt;
                        &lt;label class="form-label"&gt;Site *&lt;/label&gt;
                        &lt;select class="form-select" id="roundSite" required&gt;
                            &lt;option value=""&gt;Sélectionner un site&lt;/option&gt;
                        &lt;/select&gt;
                    &lt;/div&gt;
                    &lt;div class="mb-3"&gt;
                        &lt;label class="form-label"&gt;Date *&lt;/label&gt;
                        &lt;input type="date" class="form-control" id="roundDate" required&gt;
                    &lt;/div&gt;
                    &lt;div class="row"&gt;
                        &lt;div class="col-md-6 mb-3"&gt;
                            &lt;label class="form-label"&gt;Heure de début *&lt;/label&gt;
                            &lt;input type="time" class="form-control" id="roundStartTime" required&gt;
                        &lt;/div&gt;
                        &lt;div class="col-md-6 mb-3"&gt;
                            &lt;label class="form-label"&gt;Heure de fin&lt;/label&gt;
                            &lt;input type="time" class="form-control" id="roundEndTime"&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                    &lt;div class="mb-3"&gt;
                        &lt;label class="form-label"&gt;Notes&lt;/label&gt;
                        &lt;textarea class="form-control" id="roundNotes" rows="3"&gt;&lt;/textarea&gt;
                    &lt;/div&gt;
                    &lt;button type="submit" class="btn btn-primary w-100"&gt;Ajouter&lt;/button&gt;
                &lt;/form&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;

&lt;script&gt;
let currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

// Générer le calendrier
function generateCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    const tbody = document.getElementById('calendarBody');
    tbody.innerHTML = '';
    
    let date = 1;
    for (let i = 0; i &lt; 6; i++) {
        let row = document.createElement('tr');
        
        for (let j = 0; j &lt; 7; j++) {
            if (i === 0 && j &lt; startingDay) {
                let cell = document.createElement('td');
                cell.className = 'text-center';
                cell.textContent = '';
                row.appendChild(cell);
            } else if (date &gt; totalDays) {
                let cell = document.createElement('td');
                cell.className = 'text-center';
                cell.textContent = '';
                row.appendChild(cell);
            } else {
                let cell = document.createElement('td');
                cell.className = 'text-center calendar-day';
                cell.style.height = '100px';
                cell.style.verticalAlign = 'top';
                cell.style.cursor = 'pointer';
                
                const isToday = date === currentDate.getDate() && 
                               month === currentDate.getMonth() && 
                               year === currentDate.getFullYear();
                
                if (isToday) {
                    cell.classList.add('bg-light');
                    cell.style.fontWeight = 'bold';
                }
                
                cell.innerHTML = `
                    &lt;div class="p-1"&gt;
                        &lt;small&gt;${date}&lt;/small&gt;
                    &lt;/div&gt;
                    &lt;div class="day-events"&gt;
                        &lt;small class="badge badge-info w-100 mb-1"&gt;Ronde&lt;/small&gt;
                    &lt;/div&gt;
                `;
                
                cell.addEventListener('click', function() {
                    const day = date;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    document.getElementById('roundDate').value = dateStr;
                    new bootstrap.Modal(document.getElementById('addRoundModal')).show();
                });
                
                row.appendChild(cell);
                date++;
            }
        }
        
        tbody.appendChild(row);
        
        if (date &gt; totalDays) {
            break;
        }
    }
}

// Mois précédent
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

// Mois suivant
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

// Charger les rondes
async function loadRounds() {
    // Placeholder - À remplacer par l'appel API réel
    const tbody = document.getElementById('roundsList');
    
    const mockRounds = [
        {
            date: '2024-01-15',
            site: 'Site A',
            time: '22:00 - 06:00',
            agent: 'Jean Dupont',
            status: 'termine'
        },
        {
            date: '2024-01-16',
            site: 'Site B',
            time: '20:00 - 04:00',
            agent: 'Marie Martin',
            status: 'planifie'
        }
    ];
    
    tbody.innerHTML = mockRounds.map(round =&gt; {
        const statusClass = {
            'planifie': 'info',
            'en_cours': 'warning',
            'termine': 'success',
            'annule': 'danger'
        }[round.status];
        
        return `
            &lt;tr&gt;
                &lt;td&gt;${new Date(round.date).toLocaleDateString('fr-FR')}&lt;/td&gt;
                &lt;td&gt;&lt;strong&gt;${round.site}&lt;/strong&gt;&lt;/td&gt;
                &lt;td&gt;${round.time}&lt;/td&gt;
                &lt;td&gt;${round.agent}&lt;/td&gt;
                &lt;td&gt;&lt;span class="badge badge-${statusClass}"&gt;${round.status}&lt;/span&gt;&lt;/td&gt;
                &lt;td&gt;
                    &lt;div class="btn-group btn-group-sm"&gt;
                        &lt;button class="btn btn-primary"&gt;&lt;i class="fas fa-edit"&gt;&lt;/i&gt;&lt;/button&gt;
                        &lt;button class="btn btn-danger"&gt;&lt;i class="fas fa-trash"&gt;&lt;/i&gt;&lt;/button&gt;
                    &lt;/div&gt;
                &lt;/td&gt;
            &lt;/tr&gt;
        `;
    }).join('');
}

// Exporter iCal
function exportICal() {
    alert('La fonctionnalité d\'export iCal sera bientôt disponible');
}

// Charger les sites pour le formulaire
async function loadSites() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/admin/sites', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('roundSite');
            select.innerHTML = '&lt;option value=""&gt;Sélectionner un site&lt;/option&gt;';
            data.data.forEach(site =&gt; {
                select.innerHTML += `&lt;option value="${site.id}"&gt;${site.name}&lt;/option&gt;`;
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des sites:', error);
    }
}

// Soumettre le formulaire de ronde
document.getElementById('roundForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('La fonctionnalité de création de ronde sera bientôt disponible');
    bootstrap.Modal.getInstance(document.getElementById('addRoundModal')).hide();
});

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    generateCalendar(currentYear, currentMonth);
    loadRounds();
    loadSites();
});
&lt;/script&gt;

&lt;style&gt;
.calendar-table {
    table-layout: fixed;
}

.calendar-day {
    border: 1px solid #dee2e6;
}

.calendar-day:hover {
    background-color: #f8f9fa;
}

.day-events {
    font-size: 0.7rem;
}
&lt;/style&gt;
&lt;?php
$content = ob_get_clean();

require_once __DIR__ . '/../views/components/layout.php';
?&gt;