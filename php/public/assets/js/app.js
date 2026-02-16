/**
 * NightWatch - Application principale JavaScript
 */

const API_URL = '/api';

class NightWatchApp {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.init();
    }

    init() {
        this.setupNavigation();
        this.checkAuth();
        this.setupEventListeners();
    }

    /**
     * Vérifier l'authentification
     */
    checkAuth() {
        const path = window.location.pathname;
        
        if (!this.token && path !== '/login.php' && path !== '/') {
            window.location.href = '/login.php';
            return;
        }

        if (this.token && (path === '/login.php' || path === '/')) {
            window.location.href = '/dashboard.php';
            return;
        }
    }

    /**
     * Configurer la navigation
     */
    setupNavigation() {
        // Mettre à jour le menu utilisateur
        if (this.user) {
            const userMenu = document.getElementById('userMenu');
            if (userMenu) {
                userMenu.innerHTML = `
                    <div class="dropdown">
                        <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-user"></i> ${this.user.first_name} ${this.user.last_name}
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="/profile.php"><i class="fas fa-user-cog"></i> Mon Profil</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" onclick="app.logout()"><i class="fas fa-sign-out-alt"></i> Déconnexion</a></li>
                        </ul>
                    </div>
                `;
            }
        }
    }

    /**
     * Configurer les écouteurs d'événements
     */
    setupEventListeners() {
        // Formulaires
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        });

        // Boutons de suppression
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDelete(e));
        });
    }

    /**
     * Gérer la soumission de formulaire
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Convertir les checkboxes
        form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            data[checkbox.name] = checkbox.checked ? 1 : 0;
        });

        const action = form.dataset.action;
        const method = form.dataset.method || 'POST';

        try {
            const response = await this.apiCall(action, method, data);
            
            if (response.success) {
                this.showSuccess(response.message || 'Opération réussie');
                
                if (form.dataset.redirect) {
                    setTimeout(() => {
                        window.location.href = form.dataset.redirect;
                    }, 1000);
                } else if (form.dataset.reload) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } else {
                this.showError(response.message || 'Erreur lors de l\'opération');
            }
        } catch (error) {
            this.showError('Erreur de connexion au serveur');
            console.error(error);
        }
    }

    /**
     * Gérer la suppression
     */
    async handleDelete(e) {
        e.preventDefault();
        const btn = e.target;
        const url = btn.dataset.url;
        const confirmMsg = btn.dataset.confirm || 'Êtes-vous sûr de vouloir supprimer cet élément ?';

        if (!confirm(confirmMsg)) {
            return;
        }

        try {
            const response = await this.apiCall(url, 'DELETE');
            
            if (response.success) {
                this.showSuccess(response.message || 'Suppression réussie');
                if (btn.dataset.reload) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } else {
                this.showError(response.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            this.showError('Erreur de connexion au serveur');
            console.error(error);
        }
    }

    /**
     * Appel API
     */
    async apiCall(endpoint, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(API_URL + endpoint, options);
        return await response.json();
    }

    /**
     * Connexion
     */
    async login(email, password) {
        try {
            const response = await this.apiCall('/auth/login', 'POST', { email, password });
            
            if (response.success) {
                this.token = response.data.token;
                this.user = response.data.user;
                
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                this.showSuccess('Connexion réussie');
                setTimeout(() => {
                    window.location.href = '/dashboard.php';
                }, 1000);
                
                return true;
            } else {
                this.showError(response.message || 'Identifiants invalides');
                return false;
            }
        } catch (error) {
            this.showError('Erreur de connexion au serveur');
            console.error(error);
            return false;
        }
    }

    /**
     * Déconnexion
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.token = null;
        this.user = null;
        window.location.href = '/login.php';
    }

    /**
     * Afficher un message de succès
     */
    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    /**
     * Afficher un message d'erreur
     */
    showError(message) {
        this.showAlert(message, 'danger');
    }

    /**
     * Afficher une alerte
     */
    showAlert(message, type = 'info') {
        // Créer l'élément alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '9999';
        alert.style.minWidth = '300px';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alert);

        // Supprimer après 3 secondes
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    /**
     * Formater la date
     */
    formatDate(date) {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Charger les sites
     */
    async loadSites() {
        const response = await this.apiCall('/admin/sites');
        if (response.success) {
            const select = document.getElementById('site_id');
            if (select) {
                select.innerHTML = '<option value="">Sélectionner un site</option>';
                response.data.forEach(site => {
                    select.innerHTML += `<option value="${site.id}">${site.name} (${site.client_name})</option>`;
                });
            }
        }
    }

    /**
     * Charger les utilisateurs
     */
    async loadUsers() {
        const response = await this.apiCall('/admin/users');
        if (response.success) {
            const select = document.getElementById('user_id');
            if (select) {
                select.innerHTML = '<option value="">Sélectionner un utilisateur</option>';
                response.data.forEach(user => {
                    select.innerHTML += `<option value="${user.id}">${user.first_name} ${user.last_name}</option>`;
                });
            }
        }
    }
}

// Initialiser l'application
const app = new NightWatchApp();