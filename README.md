# NightWatch - Système Complet de Gestion de Gardes de Nuit

Plateforme complète de gestion et de reporting pour les services de garde de nuit avec applications web, mobile Android et backend API.

## 🎯 Vue d'Ensemble

NightWatch est une solution tout-en-un pour la gestion des gardes de nuit, comprenant:
- **Application Web** - Interface de gestion complète
- **Application Mobile Android** - Application mobile React Native
- **Backend API** - API RESTful avec Node.js et MySQL
- **Base de Données** - MySQL avec chiffrement RGPD

## 📦 Composants du Projet

### 1. Backend (Node.js + Express + MySQL)
**Dossier**: `backend/`

Application serveur avec API RESTful complète.

**Fonctionnalités:**
- 🔐 Authentification JWT avec gestion de sessions
- 📝 CRUD complet pour les rapports
- 🚨 Gestion des événements (incidents/observations)
- 📷 Upload et gestion des photos
- 📅 Planning avec export iCal
- 💬 Chat en temps réel avec Socket.io
- ⚙️ Admin complet (utilisateurs, sites, clients)
- 📧 Envoi d'emails avec PDF
- 🔒 Chiffrement AES-256 pour la conformité RGPD

**Installation:**
```bash
cd backend
npm install
cp .env.example .env
# Configurer .env avec vos paramètres
npm start
```

### 2. Frontend (React + Vite)
**Dossier**: `frontend/`

Application web moderne avec interface utilisateur ergonomique.

**Fonctionnalités:**
- 📊 Tableau de bord avec statistiques
- 📝 Gestion complète des rapports
- 📅 Visualisation du planning
- 📜 Historique avec filtres avancés
- 💬 Chat en temps réel
- ⚙️ Interface admin
- 🎨 Interface moderne avec Tailwind CSS

**Installation:**
```bash
cd frontend
npm install
npm run dev
```

**Accès**: http://localhost:5173

### 3. Application Mobile Android (React Native)
**Dossier**: `NightWatchApp/`

Application mobile complète pour les veilleurs sur le terrain.

**Fonctionnalités:**
- 📱 10 écrans fonctionnels
- 📷 Caméra et galerie intégrées
- 💬 Chat en temps réel
- 📅 Planning avec iCal
- 📄 Export PDF et email
- 🎨 Interface optimisée mobile
- 🌐 Fonctionne offline (partiellement)

**Installation:**
```bash
cd NightWatchApp
npm install --legacy-peer-deps
# Configurer .env avec API_URL et SOCKET_URL
npm start
npm run android
```

**Construire APK:**
```bash
./build-apk.sh
# Ou manuellement:
cd android && ./gradlew assembleRelease
```

### 4. Documentation
- **GUIDE_UTILISATION.md** - Guide utilisateur complet
- **WEB-README.md** - Documentation spécifique application web
- **NightWatchApp/README.md** - Documentation Android
- **NightWatchApp/ANDROID_GUIDE.md** - Guide utilisateur Android
- **screenshots/** - Captures d'écran de l'application Android

### 5. Packages de Distribution
- **NightWatch-Application.zip** - Application web complète (10.9 MB)
- **Installation automatique**: `install.ps1` (Windows)

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 20+
- MySQL 8.0+
- npm ou yarn
- Android Studio (pour l'app mobile)

### Installation Complète

1. **Cloner le dépôt**
```bash
git clone https://github.com/vincentmichau/ninjaguard.git
cd ninjaguard
```

2. **Configurer la base de données**
```bash
cd backend
# Créer la base de données MySQL
mysql -u root -p < database/schema.sql
```

3. **Démarrer le Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configurer .env
npm start
```

4. **Démarrer le Frontend**
```bash
cd frontend
npm install
npm run dev
```

5. **Optionnel: Démarrer l'App Mobile**
```bash
cd NightWatchApp
npm install --legacy-peer-deps
# Configurer .env
npm start
npm run android
```

### Identifiants par Défaut

- **Email**: admin@nightwatch.fr
- **Mot de passe**: Admin123!

## 🎨 Stack Technologique

### Backend
- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Base de données**: MySQL 8.0
- **Authentification**: JWT (jsonwebtoken)
- **Temps réel**: Socket.io
- **Upload**: Multer
- **Chiffrement**: crypto (AES-256)
- **Email**: Nodemailer
- **PDF**: PDFKit

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP**: Axios
- **Routing**: React Router
- **State**: React Context
- **UI**: Composants personnalisés

### Mobile Android
- **Framework**: React Native 0.84.0
- **Navigation**: React Navigation
- **State**: React Context API
- **HTTP**: Axios
- **Temps réel**: Socket.io Client
- **Stockage**: AsyncStorage
- **Icônes**: react-native-vector-icons
- **Caméra**: react-native-image-picker

## 📱 Fonctionnalités par Rôle

### Admin
- ✅ Accès complet à toutes les fonctionnalités
- ✅ Gestion des utilisateurs, sites, clients
- ✅ Validation des rapports
- ✅ Vue statistiques
- ✅ Gestion des destinataires email

### Superviseur
- ✅ Vue et gestion des rapports
- ✅ Validation des rapports
- ✅ Planning et historique
- ✅ Chat avec l'équipe

### Veilleur
- ✅ Création et édition de rapports
- ✅ Upload de photos
- ✅ Vue planning
- ✅ Chat avec l'équipe

## 🔐 Sécurité

- 🔒 Chiffrement AES-256 des données sensibles (RGPD)
- 🔐 Authentification JWT avec refresh token
- 🛡️ Validation des entrées
- 🚫 Rate limiting
- 📋 Audit logs
- ✅ Sanitization des inputs
- 🔒 HTTPS support

## 📚 Documentation Détaillée

### Guides Utilisateurs
- [Guide d'Utilisation Complet](GUIDE_UTILISATION.md) - Guide détaillé pour tous les utilisateurs
- [Guide Android](NightWatchApp/ANDROID_GUIDE.md) - Guide spécifique application mobile
- [Guide Web](WEB-README.md) - Guide application web

### Documentation Technique
- [Documentation Backend](backend/README.md)
- [Documentation Frontend](frontend/README.md)
- [Documentation Android](NightWatchApp/README.md)

### Captures d'Écran
Voir le dossier `screenshots/` pour les captures d'écran de l'application Android.

## 🛠️ Dépannage

### Backend
```bash
# Problèmes de connexion MySQL
# Vérifier database/config.js

# Redémarrer le serveur
cd backend
npm start
```

### Frontend
```bash
# Erreurs de build
cd frontend
rm -rf node_modules
npm install

# Problèmes de port
# Vérifier que le backend tourne sur le port 3000
```

### Mobile
```bash
# Metro bundler ne démarre pas
npx react-native start --reset-cache

# Erreurs de build
cd android
./gradlew clean
cd ..
npm install --legacy-peer-deps
```

### Problèmes de Connexion API

- **Émulateur Android**: Utiliser `10.0.2.2` pour localhost
- **Appareil physique**: Utiliser l'IP locale du serveur
- **Web**: `http://localhost:3000/api`

## 📊 Architecture

```
NightWatch/
├── backend/              # API RESTful (Node.js + Express)
│   ├── config/          # Configuration (base de données, chiffrement)
│   ├── routes/          # Routes API
│   ├── models/          # Modèles de données
│   ├── socket/          # Socket.io (chat)
│   └── database/        # Schéma MySQL
├── frontend/            # Application Web (React + Vite)
│   ├── src/
│   │   ├── pages/      # Pages de l'application
│   │   ├── components/ # Composants réutilisables
│   │   └── contexts/   # Contextes React
│   └── public/
├── NightWatchApp/       # Application Mobile (React Native)
│   ├── src/
│   │   ├── screens/    # Écrans de l'application
│   │   ├── components/ # Composants UI
│   │   ├── services/   # Services API
│   │   └── navigation/ # Navigation
│   ├── android/        # Configuration Android
│   └── ios/           # Configuration iOS (optionnel)
├── docs/               # Documentation
├── screenshots/        # Captures d'écran
├── GUIDE_UTILISATION.md
├── WEB-README.md
└── README.md          # Ce fichier
```

## 🚀 Déploiement

### Production

1. **Backend**
   - Configurer `.env` pour la production
   - Utiliser PM2 pour la gestion des processus
   - Configurer HTTPS avec SSL
   - Configurer MySQL pour la production

2. **Frontend**
   - Builder pour la production: `npm run build`
   - Déployer sur un serveur web (Nginx, Apache)
   - Configurer le proxy vers le backend

3. **Mobile**
   - Construire l'APK de release
   - Signer l'APK avec votre keystore
   - Publier sur Play Store

### Installation Automatique (Windows)

Le script `install.ps1` automatise l'installation complète sur Windows:
- Installation des dépendances
- Configuration de la base de données
- Démarrage des services
- Création de raccourcis

## 📄 Licence

Copyright © 2024 NightWatch. Tous droits réservés.

## 🤝 Contribution

Pour contribuer au projet:
1. Fork le dépôt
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📞 Support

Pour le support technique:
- Consultez la documentation
- Vérifiez le guide de dépannage
- Ouvrez une issue sur GitHub

## 🎯 Points Forts

✅ Solution complète (Web + Mobile + Backend)
✅ Interface moderne et intuitive
✅ Conformité RGPD avec chiffrement
✅ Fonctionnalités temps réel (chat)
✅ Export PDF et email
✅ Planning avec iCal
✅ Gestion des photos
✅ Documentation complète
✅ Prêt pour la production

---

**Note**: Ce projet est une solution complète et professionnelle pour la gestion des gardes de nuit. Tous les composants sont intégrés et prêts à être déployés en production.