# NightWatch - Plateforme Unifiée Multi-Applications

## 🌟 Vue d'ensemble

NightWatch est une plateforme de gestion de rondes de nuit **complète et interconnectée** qui permet une utilisation **simultanée et en temps réel** sur toutes les plateformes.

### Applications Incluées

1. **Backend API (Node.js/Express)** - API unifiée servant toutes les applications
2. **Frontend Web React** - Application web moderne et responsive
3. **Frontend Web PHP** - Application web alternative (Bootstrap)
4. **Application Mobile (React Native)** - Application mobile Android/iOS

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Base de Données MySQL                    │
│                    (Données partagées)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API Node.js/Express                    │
│              + Socket.io (Temps Réel)                       │
│              Port: 5000                                     │
│              Sert toutes les applications                   │
└───────┬─────────────┬──────────────┬───────────────────────┘
        │             │              │
        ▼             ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ React Web    │ │ PHP Web      │ │ Mobile App   │
│ (Vite: 5173) │ │ (Apache:8000)│ │ (React Native)│
└──────────────┘ └──────────────┘ └──────────────┘
```

### Points Clés de l'Architecture

- **API Centralisée**: Un seul backend Node.js/Express sert toutes les applications
- **Base de Données Partagée**: MySQL avec schéma unifié
- **Temps Réel**: Socket.io pour synchronisation instantanée entre toutes les plateformes
- **Authentification Unifiée**: JWT tokens partagés entre toutes les applications
- **CORS Multi-Origin**: Supporte toutes les plateformes simultanément

---

## 🚀 Installation Rapide

### Prérequis

- **Node.js 20.x+**
- **PHP 8.0+** (pour l'application PHP)
- **MySQL 8.0+**
- **Apache/Nginx** (optionnel pour PHP)

### Étape 1: Cloner le Repository

```bash
git clone https://github.com/vincentmichau/ninjaguard.git
cd ninjaguard
```

### Étape 2: Configurer la Base de Données

Créer la base de données MySQL:

```sql
CREATE DATABASE nightwatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Importer le schéma:

```bash
mysql -u root -p nightwatch < backend/database/schema.sql
```

### Étape 3: Installer et Démarrer le Backend

```bash
cd backend
npm install
cp .env.example .env
# Modifier .env avec vos configurations
npm start
```

Le backend sera accessible sur: **http://localhost:5000**

### Étape 4: Installer et Démarrer le Frontend Web React

```bash
cd frontend
npm install
npm run dev
```

Le frontend React sera accessible sur: **http://localhost:5173**

### Étape 5: Configurer et Démarrer le Frontend Web PHP (Optionnel)

```bash
cd php
# Exécuter le script d'installation automatique
php install.php
```

Le frontend PHP sera accessible sur: **http://localhost:8000**

### Étape 6: Installer et Démarrer l'Application Mobile (Optionnel)

```bash
cd NightWatchApp
npm install --legacy-peer-deps
npm run android
# Ou pour iOS:
# npx pod-install && npm run ios
```

### Démarrage Rapide (Toutes les applications)

```bash
# Utiliser les scripts fournis
chmod +x start-all.sh
./start-all.sh
```

---

## 🔄 Synchronisation Temps Réel

### Fonctionnalités Synchronisées

Toutes ces fonctionnalités sont synchronisées en temps réel entre **toutes les applications**:

- ✅ **Chat Équipe**: Messages instantanés entre web et mobile
- ✅ **Rapports en Direct**: Mises à jour instantanées des rapports
- ✅ **Notifications**: Alertes temps réel sur toutes les plateformes
- ✅ **Statistiques**: Données mises à jour en temps réel
- ✅ **Planification**: Calendrier synchronisé

### Comment ça marche

1. **Socket.io Server**: Le backend Node.js gère les connexions WebSocket
2. **Événements**: Chaque action émet un événement à tous les clients connectés
3. **Sync**: Chaque application écoute les événements et met à jour l'interface
4. **Multi-Origin**: CORS configuré pour autoriser toutes les origines

---

## 📱 Utilisation Multi-Plateforme

### Scénario d'Utilisation Typique

**08:00** - Agent sur site mobile (Android)
- Crée un nouveau rapport sur l'application mobile
- Ajoute des photos avec la caméra
- Signale un incident

**08:01** - Superviseur au bureau (React Web)
- Reçoit une notification instantanée
- Voit le nouveau rapport apparaître
- Peut consulter les détails et valider

**08:02** - Manager en déplacement (PHP Web sur tablette)
- Voit le rapport validé en temps réel
- Accède au chat et communique avec l'équipe
- Consulte les statistiques mises à jour

**Tout en même temps** - Chat de l'équipe actif
- Messages synchronisés entre mobile et web
- Typing indicators en temps réel
- Read receipts sur toutes les plateformes

---

## 🔐 Authentification Unifiée

### Tokens JWT Partagés

Un seul token JWT fonctionne sur **toutes les applications**:

```javascript
// Généré par le backend Node.js
const token = jwt.sign({ userId, email, role }, JWT_SECRET);

// Utilisable sur React Web, PHP Web, et React Native
// Fichier: backend/config/jwt.js
```

### Flux d'Authentification

1. **Login**: N'importe quelle application peut initier la connexion
2. **Token**: Le backend génère et retourne un JWT
3. **Stockage**: Chaque application stocke le token localement
4. **Utilisation**: Toutes les applications utilisent le même token pour les appels API
5. **Refresh**: Token renouvelable automatiquement

---

## 📊 Base de Données Unifiée

### Schéma Commune

Toutes les applications partagent la **même base de données MySQL**:

```sql
-- Tables principales
users          -- Utilisateurs et rôles
clients        -- Clients
sites          -- Sites de ronde
reports        -- Rapports
events         -- Événements/incidents
chat_groups    -- Groupes de chat
chat_messages  -- Messages de chat
```

### Intégrité des Données

- **Clés étrangères** entre les tables
- **Transactions** pour les opérations complexes
- **Validation** au niveau base de données
- **Indexation** optimisée pour les requêtes multi-plateforme

---

## 🎯 Comparaison des Applications

| Fonctionnalité | React Web | PHP Web | Mobile |
|----------------|-----------|---------|--------|
| CRUD Rapports  | ✅        | ✅      | ✅     |
| Chat Temps Réel| ✅        | ✅      | ✅     |
| Photos/Caméra  | ✅ Upload | ✅ Upload| ✅ Native |
| Notifications  | ✅        | ✅      | ✅ Push |
| PDF Export     | ✅        | ✅      | ⏳     |
| iCal Export    | ✅        | ✅      | ✅     |
| GPS Tracking   | ❌        | ❌      | ✅     |
| Offline Mode   | ❌        | ❌      | ⏳     |

---

## 🛠️ Configuration Avancée

### Backend (Node.js)

Fichier: `backend/.env`

```env
# Port
PORT=5000

# URLs Frontends
REACT_FRONTEND_URL=http://localhost:5173
PHP_FRONTEND_URL=http://localhost:8000
MOBILE_FRONTEND_URL=http://localhost:19006

# Base de données
DB_HOST=localhost
DB_NAME=nightwatch
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=votre-cle-secrete
JWT_EXPIRES_IN=24h
```

### Frontend React

Fichier: `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Frontend PHP

Fichier: `php/config/config.php`

```php
// API Backend Node.js
define('BACKEND_API_URL', 'http://localhost:5000/api');
```

### Mobile React Native

Fichier: `NightWatchApp/.env`

```env
API_URL=http://10.0.2.2:5000/api  // 10.0.2.2 = localhost sur émulateur Android
SOCKET_URL=http://10.0.2.2:5000
```

---

## 📚 Documentation Spécifique

### Backend Node.js
- Voir: `backend/README.md`
- API Documentation: `backend/API.md`

### Frontend React
- Voir: `frontend/README.md`
- Guide Utilisateur: `WEB-README.md`

### Frontend PHP
- Voir: `php/README.md`
- Guide Utilisateur: `php/GUIDE_UTILISATION.md`

### Mobile React Native
- Voir: `NightWatchApp/ANDROID_GUIDE.md`

---

## 🚢 Déploiement en Production

### Backend (Node.js)

```bash
cd backend
pm2 start server.js --name nightwatch-api
```

### Frontend React (Build + Serve)

```bash
cd frontend
npm run build
# Servir avec nginx ou Vercel
```

### Frontend PHP (Apache)

```bash
cd php
# Configurer Apache VirtualHost
# Pointer vers le dossier public/
```

### Mobile (Build APK/IPA)

```bash
cd NightWatchApp
npm run android (release)
# Ou pour iOS
npm run ios (release)
```

---

## 🔧 Scripts Utilitaires

### Démarrer toutes les applications

```bash
./start-all.sh
```

### Arrêter toutes les applications

```bash
./stop-all.sh
```

### Installer l'application PHP

```bash
php php/install.php
```

---

## 🐛 Dépannage

### Problème: CORS sur les applications

**Solution**: Vérifier que `backend/server.js` inclut toutes les origines dans la configuration CORS.

### Problème: Socket.io ne se connecte pas sur mobile

**Solution**: Sur Android émulateur, utilisez `10.0.2.2` au lieu de `localhost`.

### Problème: Base de données non synchronisée

**Solution**: Assurez-vous que toutes les applications utilisent la même base de données `nightwatch`.

### Problème: Token JWT invalide sur certaines applications

**Solution**: Vérifiez que `JWT_SECRET` est identique dans tous les fichiers `.env`.

---

## 🤝 Contribution

Pour contribuer au projet:

1. Fork le repository
2. Créez une branche feature: `git checkout -b feature/ma-fonction`
3. Commit vos changements: `git commit -m 'Ajout de ma fonction'`
4. Push vers la branche: `git push origin feature/ma-fonction`
5. Ouvrez une Pull Request

---

## 📝 Licence

Ce projet est sous licence MIT.

---

## 👥 Support

Pour toute question ou problème:

- 📧 Email: support@nightwatch.fr
- 📱 GitHub Issues: https://github.com/vincentmichau/ninjaguard/issues
- 📖 Documentation: https://docs.nightwatch.fr

---

## 🎉 Fonctionnalités à Venir

- [ ] Application iOS native
- [ ] Mode hors ligne pour mobile
- [ ] Notifications push réelles (Firebase)
- [ ] Tableau de bord analytique avancé
- [ ] Intégration avec d'autres systèmes RH
- [ ] API publique pour tiers
- [ ] Webhooks pour intégrations
- [ ] Exportation en formats multiples

---

**Version Actuelle**: 1.0.0
**Dernière Mise à Jour**: 2024
**Développeur**: NightWatch Team 🚀