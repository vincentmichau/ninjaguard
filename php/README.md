# NightWatch - Application PHP/MySQL/Bootstrap

Système de gestion de rondes de nuit complet et professionnel.

## 🌟 Caractéristiques

- ✅ **Interface utilisateur moderne et responsive** avec Bootstrap 5
- ✅ **Authentification JWT** sécurisée
- ✅ **Gestion complète des rapports** (CRUD)
- ✅ **Système de validation** des rapports
- ✅ **Gestion des événements/incidents**
- ✅ **Interface d'administration** complète
- ✅ **Chat en temps réel** (interface)
- ✅ **Filtres avancés** et recherche
- ✅ **Pagination** des résultats
- ✅ **Design unifié** et professionnel
- ✅ **100% PHP pur** (framework PHP)

## 📋 Prérequis

- **PHP 8.0 ou supérieur**
- **MySQL 8.0 ou supérieur** (ou MariaDB 10.4+)
- **Apache** (avec mod_rewrite) ou **Nginx**
- **Composer** (optionnel pour les dépendances futures)

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd nightwatch-php
```

### 2. Configurer la base de données

Créer une base de données MySQL :

```sql
CREATE DATABASE nightwatch_php CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Importer le schéma :

```bash
mysql -u root -p nightwatch_php < database/schema.sql
```

### 3. Configuration

Copier et modifier le fichier de configuration :

```bash
cp config/config.php.example config/config.php
```

Modifier les paramètres dans `config/config.php` :

```php
// Base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'nightwatch_php');
define('DB_USER', 'votre_utilisateur');
define('DB_PASS', 'votre_mot_de_passe');

// JWT Secret (IMPORTANT: Changez cette valeur en production)
define('JWT_SECRET', 'votre-cle-secrete-unique');

// URL de base
define('BASE_URL', 'http://localhost:8000');
```

### 4. Configuration du serveur

#### Option A: Apache

Créer un fichier `.htaccess` dans le dossier `public/` :

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

#### Option B: PHP Built-in Server (Développement)

```bash
cd public
php -S localhost:8000
```

L'application sera accessible sur : `http://localhost:8000`

#### Option C: Nginx

Configuration Nginx exemple :

```nginx
server {
    listen 80;
    server_name nightwatch.local;
    root /path/to/nightwatch-php/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 5. Permissions

Assurez-vous que PHP peut écrire dans les dossiers suivants :

```bash
chmod -R 755 public/uploads
chmod -R 755 logs
```

## 👤 Compte par défaut

Après l'installation, connectez-vous avec :

- **Email**: `admin@nightwatch.fr`
- **Mot de passe**: `Admin123!`

⚠️ **IMPORTANT**: Changez ce mot de passe dès la première connexion !

## 📁 Structure du projet

```
nightwatch-php/
├── api/
│   ├── controllers/      # Contrôleurs API
│   ├── middleware/       # Middleware (authentification)
│   ├── models/           # Modèles de base de données
│   └── routes/           # Routes API
├── config/
│   ├── config.php        # Configuration principale
│   └── JWT.php           # Gestionnaire JWT
├── database/
│   ├── schema.sql        # Schéma de base de données
│   └── Database.php      # Classe de connexion
├── public/
│   ├── api/              # Point d'entrée API
│   ├── assets/           # Assets statiques
│   │   ├── css/          # Styles personnalisés
│   │   └── js/           # JavaScript
│   ├── uploads/          # Fichiers uploadés
│   ├── login.php         # Page de connexion
│   ├── dashboard.php     # Tableau de bord
│   ├── reports.php       # Liste des rapports
│   ├── report-form.php   # Formulaire de rapport
│   ├── report-view.php   # Détail de rapport
│   ├── history.php       # Historique
│   ├── chat.php          # Chat
│   ├── admin.php         # Administration
│   └── profile.php       # Profil utilisateur
├── views/
│   └── components/
│       └── layout.php    # Layout principal
├── logs/                 # Logs de l'application
├── README.md             # Ce fichier
└── .gitignore
```

## 🔌 API Endpoints

### Authentification

- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/me` - Obtenir l'utilisateur actuel
- `POST /api/auth/change-password` - Changer le mot de passe

### Rapports

- `GET /api/reports` - Lister les rapports
- `POST /api/reports` - Créer un rapport
- `GET /api/reports/{id}` - Obtenir un rapport
- `PUT /api/reports/{id}` - Mettre à jour un rapport
- `DELETE /api/reports/{id}` - Supprimer un rapport
- `POST /api/reports/{id}/validate` - Valider un rapport
- `GET /api/reports/stats` - Obtenir les statistiques

### Administration

- `GET /api/admin/dashboard` - Tableau de bord admin
- `GET /api/admin/users` - Lister les utilisateurs
- `POST /api/admin/users` - Créer un utilisateur
- `PUT /api/admin/users/{id}` - Mettre à jour un utilisateur
- `DELETE /api/admin/users/{id}` - Supprimer un utilisateur
- `GET /api/admin/sites` - Lister les sites
- `POST /api/admin/sites` - Créer un site
- `PUT /api/admin/sites/{id}` - Mettre à jour un site
- `DELETE /api/admin/sites/{id}` - Supprimer un site
- `GET /api/admin/clients` - Lister les clients
- `POST /api/admin/clients` - Créer un client
- `PUT /api/admin/clients/{id}` - Mettre à jour un client
- `DELETE /api/admin/clients/{id}` - Supprimer un client

## 🔐 Sécurité

- ✅ Authentification JWT avec expiration
- ✅ Protection contre les injections SQL (PDO prepared statements)
- ✅ Validation des entrées
- ✅ Rôles et permissions
- ✅ Protection CSRF (à implémenter)
- ✅ Hashage des mots de passe (bcrypt)
- ✅ Logs d'audit

## 🎨 Personnalisation

### Couleurs

Modifier les variables CSS dans `public/assets/css/style.css` :

```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --success-color: #27ae60;
    /* ... */
}
```

### Logo

Remplacer l'icône dans le layout `views/components/layout.php`.

## 📱 Responsive Design

L'application est entièrement responsive et fonctionne sur :
- 📱 Mobile (320px+)
- 📱 Tablette (768px+)
- 💻 Desktop (1024px+)

## 🚧 Fonctionnalités à venir

- [ ] Génération PDF des rapports
- [ ] Envoi d'emails automatiques
- [ ] Chat en temps réel avec WebSocket
- [ ] Planification et gestion des rondes
- [ ] Import/Export iCal
- [ ] API RH (Combo) integration
- [ ] Système de notifications
- [ ] Dashboard avancé avec graphiques
- [ ] Rapports personnalisés

## 🛠️ Développement

### Activer le mode développement

Dans `config/config.php` :

```php
define('ENVIRONMENT', 'development');
```

### Voir les erreurs

Les erreurs sont affichées en mode développement dans `logs/`.

## 📝 Tests

### Tests manuels

1. Se connecter avec le compte admin
2. Créer un site et un client
3. Créer un utilisateur veilleur
4. Se connecter en tant que veilleur
5. Créer un rapport avec événements
6. Valider le rapport en tant qu'admin
7. Vérifier l'historique et les filtres

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

- **NightWatch Team**

## 📞 Support

Pour toute question ou problème :
- Email: support@nightwatch.fr
- Documentation: Voir le dossier `docs/`

## 🙏 Remerciements

- Bootstrap 5 pour le framework CSS
- Font Awesome pour les icônes
- La communauté PHP

---

**Version**: 1.0.0  
**Dernière mise à jour**: <?php echo date('d/m/Y'); ?>