&lt;?php
/**
 * NightWatch - Panneau d'administration
 */

session_start();

// Vérifier l'authentification et les droits
if (!isset($_SESSION['token'])) {
    header('Location: /login.php');
    exit();
}

$user = json_decode($_SESSION['user'], true);

if ($user['role'] !== 'admin' && $user['role'] !== 'supervisor') {
    header('Location: /dashboard.php');
    exit();
}

// Charger le layout
$content = ob_get_clean();

ob_start();
?&gt;
&lt;div class="container-fluid py-4"&gt;
    &lt;div class="row"&gt;
        &lt;!-- Sidebar --&gt;
        &lt;div class="col-md-2"&gt;
            &lt;div class="sidebar"&gt;
                &lt;h5 class="mb-4"&gt;&lt;i class="fas fa-cog"&gt;&lt;/i&gt; Administration&lt;/h5&gt;
                &lt;a href="#" class="sidebar-link active" data-tab="dashboard"&gt;
                    &lt;i class="fas fa-tachometer-alt"&gt;&lt;/i&gt; Tableau de bord
                &lt;/a&gt;
                &lt;?php if ($user['role'] === 'admin'): ?&gt;
                &lt;a href="#" class="sidebar-link" data-tab="users"&gt;
                    &lt;i class="fas fa-users"&gt;&lt;/i&gt; Utilisateurs
                &lt;/a&gt;
                &lt;a href="#" class="sidebar-link" data-tab="sites"&gt;
                    &lt;i class="fas fa-building"&gt;&lt;/i&gt; Sites
                &lt;/a&gt;
                &lt;a href="#" class="sidebar-link" data-tab="clients"&gt;
                    &lt;i class="fas fa-briefcase"&gt;&lt;/i&gt; Clients
                &lt;/a&gt;
                &lt;?php endif; ?&gt;
                &lt;a href="#" class="sidebar-link" data-tab="settings"&gt;
                    &lt;i class="fas fa-cogs"&gt;&lt;/i&gt; Paramètres
                &lt;/a&gt;
            &lt;/div&gt;
        &lt;/div&gt;
        
        &lt;!-- Contenu principal --&gt;
        &lt;div class="col-md-10"&gt;
            &lt;!-- Dashboard --&gt;
            &lt;div id="tab-dashboard" class="tab-content fade-in"&gt;
                &lt;div class="card"&gt;
                    &lt;div class="card-header"&gt;
                        &lt;h4 class="mb-0"&gt;&lt;i class="fas fa-tachometer-alt"&gt;&lt;/i&gt; Tableau de Bord&lt;/h4&gt;
                    &lt;/div&gt;
                    &lt;div class="card-body"&gt;
                        &lt;div class="row g-4"&gt;
                            &lt;div class="col-md-3"&gt;
                                &lt;div class="stat-card"&gt;
                                    &lt;div class="stat-icon text-primary"&gt;
                                        &lt;i class="fas fa-users"&gt;&lt;/i&gt;
                                    &lt;/div&gt;
                                    &lt;div class="stat-value" id="totalUsers"&gt;-&lt;/div&gt;
                                    &lt;div class="stat-label"&gt;Utilisateurs&lt;/div&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                            &lt;div class="col-md-3"&gt;
                                &lt;div class="stat-card"&gt;
                                    &lt;div class="stat-icon text-success"&gt;
                                        &lt;i class="fas fa-building"&gt;&lt;/i&gt;
                                    &lt;/div&gt;
                                    &lt;div class="stat-value" id="totalSites"&gt;-&lt;/div&gt;
                                    &lt;div class="stat-label"&gt;Sites&lt;/div&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                            &lt;div class="col-md-3"&gt;
                                &lt;div class="stat-card"&gt;
                                    &lt;div class="stat-icon text-info"&gt;
                                        &lt;i class="fas fa-briefcase"&gt;&lt;/i&gt;
                                    &lt;/div&gt;
                                    &lt;div class="stat-value" id="totalClients"&gt;-&lt;/div&gt;
                                    &lt;div class="stat-label"&gt;Clients&lt;/div&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                            &lt;div class="col-md-3"&gt;
                                &lt;div class="stat-card"&gt;
                                    &lt;div class="stat-icon text-warning"&gt;
                                        &lt;i class="fas fa-file-alt"&gt;&lt;/i&gt;
                                    &lt;/div&gt;
                                    &lt;div class="stat-value" id="totalReports"&gt;-&lt;/div&gt;
                                    &lt;div class="stat-label"&gt;Rapports&lt;/div&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                        
                        &lt;hr class="my-4"&gt;
                        
                        &lt;h5&gt;Répartition par rôle&lt;/h5&gt;
                        &lt;div class="row mt-3"&gt;
                            &lt;div class="col-md-4"&gt;
                                &lt;div class="card text-center p-3"&gt;
                                    &lt;h6&gt;Administrateurs&lt;/h6&gt;
                                    &lt;h3 id="adminCount"&gt;-&lt;/h3&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                            &lt;div class="col-md-4"&gt;
                                &lt;div class="card text-center p-3"&gt;
                                    &lt;h6&gt;Superviseurs&lt;/h6&gt;
                                    &lt;h3 id="supervisorCount"&gt;-&lt;/h3&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                            &lt;div class="col-md-4"&gt;
                                &lt;div class="card text-center p-3"&gt;
                                    &lt;h6&gt;Veilleurs&lt;/h6&gt;
                                    &lt;h3 id="watcherCount"&gt;-&lt;/h3&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            
            &lt;?php if ($user['role'] === 'admin'): ?&gt;
            &lt;!-- Utilisateurs --&gt;
            &lt;div id="tab-users" class="tab-content d-none"&gt;
                &lt;div class="card"&gt;
                    &lt;div class="card-header d-flex justify-content-between align-items-center"&gt;
                        &lt;h4 class="mb-0"&gt;&lt;i class="fas fa-users"&gt;&lt;/i&gt; Gestion des Utilisateurs&lt;/h4&gt;
                        &lt;button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#userModal"&gt;
                            &lt;i class="fas fa-plus"&gt;&lt;/i&gt; Nouvel Utilisateur
                        &lt;/button&gt;
                    &lt;/div&gt;
                    &lt;div class="card-body"&gt;
                        &lt;div class="table-responsive"&gt;
                            &lt;table class="table table-hover"&gt;
                                &lt;thead&gt;
                                    &lt;tr&gt;
                                        &lt;th&gt;Nom&lt;/th&gt;
                                        &lt;th&gt;Email&lt;/th&gt;
                                        &lt;th&gt;Rôle&lt;/th&gt;
                                        &lt;th&gt;Actif&lt;/th&gt;
                                        &lt;th&gt;Actions&lt;/th&gt;
                                    &lt;/tr&gt;
                                &lt;/thead&gt;
                                &lt;tbody id="usersTable"&gt;
                                    &lt;tr&gt;
                                        &lt;td colspan="5" class="text-center"&gt;
                                            &lt;div class="spinner-border text-primary" role="status"&gt;&lt;/div&gt;
                                        &lt;/td&gt;
                                    &lt;/tr&gt;
                                &lt;/tbody&gt;
                            &lt;/table&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            
            &lt;!-- Sites --&gt;
            &lt;div id="tab-sites" class="tab-content d-none"&gt;
                &lt;div class="card"&gt;
                    &lt;div class="card-header d-flex justify-content-between align-items-center"&gt;
                        &lt;h4 class="mb-0"&gt;&lt;i class="fas fa-building"&gt;&lt;/i&gt; Gestion des Sites&lt;/h4&gt;
                        &lt;button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#siteModal"&gt;
                            &lt;i class="fas fa-plus"&gt;&lt;/i&gt; Nouveau Site
                        &lt;/button&gt;
                    &lt;/div&gt;
                    &lt;div class="card-body"&gt;
                        &lt;div class="table-responsive"&gt;
                            &lt;table class="table table-hover"&gt;
                                &lt;thead&gt;
                                    &lt;tr&gt;
                                        &lt;th&gt;Nom&lt;/th&gt;
                                        &lt;th&gt;Client&lt;/th&gt;
                                        &lt;th&gt;Ville&lt;/th&gt;
                                        &lt;th&gt;Actif&lt;/th&gt;
                                        &lt;th&gt;Actions&lt;/th&gt;
                                    &lt;/tr&gt;
                                &lt;/thead&gt;
                                &lt;tbody id="sitesTable"&gt;
                                    &lt;tr&gt;
                                        &lt;td colspan="5" class="text-center"&gt;
                                            &lt;div class="spinner-border text-primary" role="status"&gt;&lt;/div&gt;
                                        &lt;/td&gt;
                                    &lt;/tr&gt;
                                &lt;/tbody&gt;
                            &lt;/table&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            
            &lt;!-- Clients --&gt;
            &lt;div id="tab-clients" class="tab-content d-none"&gt;
                &lt;div class="card"&gt;
                    &lt;div class="card-header d-flex justify-content-between align-items-center"&gt;
                        &lt;h4 class="mb-0"&gt;&lt;i class="fas fa-briefcase"&gt;&lt;/i&gt; Gestion des Clients&lt;/h4&gt;
                        &lt;button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#clientModal"&gt;
                            &lt;i class="fas fa-plus"&gt;&lt;/i&gt; Nouveau Client
                        &lt;/button&gt;
                    &lt;/div&gt;
                    &lt;div class="card-body"&gt;
                        &lt;div class="table-responsive"&gt;
                            &lt;table class="table table-hover"&gt;
                                &lt;thead&gt;
                                    &lt;tr&gt;
                                        &lt;th&gt;Nom&lt;/th&gt;
                                        &lt;th&gt;Contact&lt;/th&gt;
                                        &lt;th&gt;Email&lt;/th&gt;
                                        &lt;th&gt;Téléphone&lt;/th&gt;
                                        &lt;th&gt;Actions&lt;/th&gt;
                                    &lt;/tr&gt;
                                &lt;/thead&gt;
                                &lt;tbody id="clientsTable"&gt;
                                    &lt;tr&gt;
                                        &lt;td colspan="5" class="text-center"&gt;
                                            &lt;div class="spinner-border text-primary" role="status"&gt;&lt;/div&gt;
                                        &lt;/td&gt;
                                    &lt;/tr&gt;
                                &lt;/tbody&gt;
                            &lt;/table&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            &lt;?php endif; ?&gt;
            
            &lt;!-- Paramètres --&gt;
            &lt;div id="tab-settings" class="tab-content d-none"&gt;
                &lt;div class="card"&gt;
                    &lt;div class="card-header"&gt;
                        &lt;h4 class="mb-0"&gt;&lt;i class="fas fa-cogs"&gt;&lt;/i&gt; Paramètres&lt;/h4&gt;
                    &lt;/div&gt;
                    &lt;div class="card-body"&gt;
                        &lt;div class="alert alert-info"&gt;
                            &lt;i class="fas fa-info-circle"&gt;&lt;/i&gt;
                            Les paramètres de l'application sont configurés dans le fichier config/config.php
                        &lt;/div&gt;
                        
                        &lt;div class="row"&gt;
                            &lt;div class="col-md-6"&gt;
                                &lt;div class="card"&gt;
                                    &lt;div class="card-body"&gt;
                                        &lt;h5&gt;Configuration Base de Données&lt;/h5&gt;
                                        &lt;ul class="list-unstyled"&gt;
                                            &lt;li&gt;&lt;strong&gt;Hôte:&lt;/strong&gt; &lt;?php echo DB_HOST; ?&gt;&lt;/li&gt;
                                            &lt;li&gt;&lt;strong&gt;Base:&lt;/strong&gt; &lt;?php echo DB_NAME; ?&gt;&lt;/li&gt;
                                            &lt;li&gt;&lt;strong&gt;Charset:&lt;/strong&gt; &lt;?php echo DB_CHARSET; ?&gt;&lt;/li&gt;
                                        &lt;/ul&gt;
                                    &lt;/div&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                            &lt;div class="col-md-6"&gt;
                                &lt;div class="card"&gt;
                                    &lt;div class="card-body"&gt;
                                        &lt;h5&gt;Configuration Application&lt;/h5&gt;
                                        &lt;ul class="list-unstyled"&gt;
                                            &lt;li&gt;&lt;strong&gt;Environnement:&lt;/strong&gt; &lt;?php echo ENVIRONMENT; ?&gt;&lt;/li&gt;
                                            &lt;li&gt;&lt;strong&gt;URL de base:&lt;/strong&gt; &lt;?php echo BASE_URL; ?&gt;&lt;/li&gt;
                                            &lt;li&gt;&lt;strong&gt;Items par page:&lt;/strong&gt; &lt;?php echo ITEMS_PER_PAGE; ?&gt;&lt;/li&gt;
                                        &lt;/ul&gt;
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

&lt;!-- Modals pour les formulaires (placeholders) --&gt;
&lt;?php if ($user['role'] === 'admin'): ?&gt;
&lt;div class="modal fade" id="userModal" tabindex="-1"&gt;
    &lt;div class="modal-dialog"&gt;
        &lt;div class="modal-content"&gt;
            &lt;div class="modal-header"&gt;
                &lt;h5 class="modal-title"&gt;Nouvel Utilisateur&lt;/h5&gt;
                &lt;button type="button" class="btn-close" data-bs-dismiss="modal"&gt;&lt;/button&gt;
            &lt;/div&gt;
            &lt;div class="modal-body"&gt;
                &lt;form id="userForm" data-action="/admin/users" data-method="POST" data-reload="true"&gt;
                    &lt;div class="mb-3"&gt;
                        &lt;label class="form-label"&gt;Email *&lt;/label&gt;
                        &lt;input type="email" class="form-control" name="email" required&gt;
                    &lt;/div&gt;
                    &lt;div class="mb-3"&gt;
                        &lt;label class="form-label"&gt;Mot de passe *&lt;/label&gt;
                        &lt;input type="password" class="form-control" name="password" required&gt;
                    &lt;/div&gt;
                    &lt;div class="row"&gt;
                        &lt;div class="col-md-6 mb-3"&gt;
                            &lt;label class="form-label"&gt;Prénom *&lt;/label&gt;
                            &lt;input type="text" class="form-control" name="first_name" required&gt;
                        &lt;/div&gt;
                        &lt;div class="col-md-6 mb-3"&gt;
                            &lt;label class="form-label"&gt;Nom *&lt;/label&gt;
                            &lt;input type="text" class="form-control" name="last_name" required&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                    &lt;div class="mb-3"&gt;
                        &lt;label class="form-label"&gt;Rôle *&lt;/label&gt;
                        &lt;select class="form-select" name="role" required&gt;
                            &lt;option value="watcher"&gt;Veilleur&lt;/option&gt;
                            &lt;option value="supervisor"&gt;Superviseur&lt;/option&gt;
                            &lt;option value="admin"&gt;Administrateur&lt;/option&gt;
                        &lt;/select&gt;
                    &lt;/div&gt;
                    &lt;button type="submit" class="btn btn-primary w-100"&gt;Créer&lt;/button&gt;
                &lt;/form&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;
&lt;?php endif; ?&gt;

&lt;script&gt;
const API_URL = '/api';

// Gestion des onglets
document.querySelectorAll('.sidebar-link').forEach(link =&gt; {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const tab = this.dataset.tab;
        
        // Mettre à jour les liens actifs
        document.querySelectorAll('.sidebar-link').forEach(l =&gt; l.classList.remove('active'));
        this.classList.add('active');
        
        // Afficher le contenu correspondant
        document.querySelectorAll('.tab-content').forEach(content =&gt; {
            content.classList.add('d-none');
            content.classList.remove('fade-in');
        });
        
        const targetTab = document.getElementById('tab-' + tab);
        targetTab.classList.remove('d-none');
        targetTab.classList.add('fade-in');
        
        // Charger les données
        loadDashboardData();
    });
});

// Charger les données du dashboard
async function loadDashboardData() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(API_URL + '/admin/dashboard', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalUsers').textContent = data.data.users;
            document.getElementById('totalSites').textContent = data.data.sites;
            document.getElementById('totalClients').textContent = data.data.clients;
            document.getElementById('totalReports').textContent = data.data.reports;
            
            if (data.data.users_by_role) {
                data.data.users_by_role.forEach(item =&gt; {
                    const elementId = item.role + 'Count';
                    const element = document.getElementById(elementId);
                    if (element) {
                        element.textContent = item.count;
                    }
                });
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
}

// Charger les utilisateurs
async function loadUsers() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(API_URL + '/admin/users', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('usersTable');
            tbody.innerHTML = data.data.map(user =&gt; `
                &lt;tr&gt;
                    &lt;td&gt;&lt;strong&gt;${user.first_name} ${user.last_name}&lt;/strong&gt;&lt;/td&gt;
                    &lt;td&gt;${user.email}&lt;/td&gt;
                    &lt;td&gt;&lt;span class="badge badge-${user.role === 'admin' ? 'danger' : user.role === 'supervisor' ? 'warning' : 'info'}"&gt;${user.role}&lt;/span&gt;&lt;/td&gt;
                    &lt;td&gt;${user.is_active ? '&lt;i class="fas fa-check-circle text-success"&gt;&lt;/i&gt;' : '&lt;i class="fas fa-times-circle text-danger"&gt;&lt;/i&gt;'}&lt;/td&gt;
                    &lt;td&gt;
                        &lt;div class="btn-group btn-group-sm"&gt;
                            &lt;button class="btn btn-primary"&gt;&lt;i class="fas fa-edit"&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button class="btn btn-danger"&gt;&lt;i class="fas fa-trash"&gt;&lt;/i&gt;&lt;/button&gt;
                        &lt;/div&gt;
                    &lt;/td&gt;
                &lt;/tr&gt;
            `).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
    }
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
            const tbody = document.getElementById('sitesTable');
            tbody.innerHTML = data.data.map(site =&gt; `
                &lt;tr&gt;
                    &lt;td&gt;&lt;strong&gt;${site.name}&lt;/strong&gt;&lt;/td&gt;
                    &lt;td&gt;${site.client_name}&lt;/td&gt;
                    &lt;td&gt;${site.city || '-'}&lt;/td&gt;
                    &lt;td&gt;${site.is_active ? '&lt;i class="fas fa-check-circle text-success"&gt;&lt;/i&gt;' : '&lt;i class="fas fa-times-circle text-danger"&gt;&lt;/i&gt;'}&lt;/td&gt;
                    &lt;td&gt;
                        &lt;div class="btn-group btn-group-sm"&gt;
                            &lt;button class="btn btn-primary"&gt;&lt;i class="fas fa-edit"&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button class="btn btn-danger"&gt;&lt;i class="fas fa-trash"&gt;&lt;/i&gt;&lt;/button&gt;
                        &lt;/div&gt;
                    &lt;/td&gt;
                &lt;/tr&gt;
            `).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des sites:', error);
    }
}

// Charger les clients
async function loadClients() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(API_URL + '/admin/clients', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('clientsTable');
            tbody.innerHTML = data.data.map(client =&gt; `
                &lt;tr&gt;
                    &lt;td&gt;&lt;strong&gt;${client.name}&lt;/strong&gt;&lt;/td&gt;
                    &lt;td&gt;${client.contact_person || '-'}&lt;/td&gt;
                    &lt;td&gt;${client.contact_email || '-'}&lt;/td&gt;
                    &lt;td&gt;${client.contact_phone || '-'}&lt;/td&gt;
                    &lt;td&gt;
                        &lt;div class="btn-group btn-group-sm"&gt;
                            &lt;button class="btn btn-primary"&gt;&lt;i class="fas fa-edit"&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button class="btn btn-danger"&gt;&lt;i class="fas fa-trash"&gt;&lt;/i&gt;&lt;/button&gt;
                        &lt;/div&gt;
                    &lt;/td&gt;
                &lt;/tr&gt;
            `).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    loadUsers();
    loadSites();
    loadClients();
});
&lt;/script&gt;
&lt;?php
$content = ob_get_clean();

require_once __DIR__ . '/../views/components/layout.php';
?&gt;