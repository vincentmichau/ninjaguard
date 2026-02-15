# 🌙 NightWatch - Plateforme de Gestion de Rondes de Nuit

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-multi--platform-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

**Système professionnel de gestion de rondes de nuit - Multi-Applications &amp; Temps Réel**

[Documentation](#documentation) • [Installation Rapide](#installation-rapide) • [Démonstration](#démonstration)

</div>

---

## ✨ Caractéristiques

NightWatch est une plateforme **complète et interconnectée** qui permet la gestion des rondes de nuit sur **toutes les plateformes simultanément** :

### 🌐 Multi-Plateforme
- 🖥️ **Application Web React** - Interface moderne et responsive
- 🌍 **Application Web PHP** - Interface alternative Bootstrap
- 📱 **Application Mobile** - Android et iOS (React Native)

### ⚡ Temps Réel
- 💬 **Chat Équipe** - Messagerie instantanée synchronisée
- 📊 **Statistiques en Direct** - Données mises à jour en temps réel
- 🔔 **Notifications** - Alertes instantanées sur toutes les plateformes
- 🔄 **Synchronisation** - Mises à jour automatiques entre applications

### 🎯 Fonctionnalités Principales
- ✅ Gestion complète des rapports de ronde
- ✅ Suivi des incidents et observations
- ✅ Validation des rapports
- ✅ Gestion des sites et clients
- ✅ Planification des rondes
- ✅ Génération de PDF
- ✅ Export iCal
- ✅ Authentification sécurisée (JWT)
- ✅ Interface d'administration complète

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Base de Données MySQL                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API Node.js/Express                    │
│              + Socket.io (Temps Réel)                       │
└───────┬─────────────┬──────────────┬───────────────────────┘
        │             │              │
        ▼             ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ React Web    │ │ PHP Web      │ │ Mobile App   │
└──────────────┘ └──────────────┘ └──────────────┘
```

**Architecture détaillée**: Voir [README-UNIFIED.md](README-UNIFIED.md)

---

## 🚀 Installation Rapide

### Prérequis

- Node.js 20.x+
- PHP 8.0+ (optionnel)
- MySQL 8.0+
- Apache/Nginx (optionnel)

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/vincentmichau/ninjaguard.git
cd ninjaguard

# 2. Configurer la base de données
mysql -u root -p
CREATE DATABASE nightwatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

mysql -u root -p nightwatch < backend/database/schema.sql

# 3. Installer le backend
cd backend
npm install
cp .env.example .env
# Modifier .env avec vos configurations
npm start
```

### Démarrer Toutes les Applications

```bash
# Script de démarrage automatique
chmod +x start-all.sh
./start-all.sh

# Ou démarrer manuellement:
# Backend (port 5000)
cd backend &amp;&amp; npm start &amp;

# React Web (port 5173)
cd frontend &amp;&amp; npm run dev &amp;

# PHP Web (port 8000) - optionnel
cd php &amp;&amp; php -S localhost:8000 -t public &amp;

# Mobile - optionnel
cd NightWatchApp &amp;&amp; npm run android &amp;
```

### Accéder aux Applications

- **React Web**: http://localhost:5173
- **PHP Web**: http://localhost:8000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

### Compte par défaut

- **Email**: admin@nightwatch.fr
- **Mot de passe**: Admin123!

⚠️ **IMPORTANT**: Changez ce mot de passe en production !

---

## 📖 Documentation

### Documentation Principale
- 📘 [Plateforme Unifiée](README-UNIFIED.md) - Architecture et interconnexion complète
- 📗 [Guide Utilisateur](GUIDE_UTILISATION.md) - Guide complet d'utilisation

### Documentation Backend
- [Backend README](backend/README.md) - Configuration et API
- [API Routes](backend/routes/) - Endpoints disponibles

### Documentation Frontend
- [React Web Guide](WEB-README.md) - Application web React
- [PHP Web Guide](php/GUIDE_UTILISATION.md) - Application web PHP
- [Mobile Guide](NightWatchApp/ANDROID_GUIDE.md) - Application mobile

---

## 🔄 Utilisation Multi-Plateforme

### Scénario d'Utilisation Typique

**08:00** - Agent sur site (Mobile Android)
- Crée un rapport avec photos
- Signale un incident

**08:01** - Superviseur au bureau (React Web)
- Reçoit notification instantanée
- Valide le rapport

**08:02** - Manager en déplacement (PHP Web)
- Consulte le rapport validé
- Communique via chat

**Tout en temps réel** - Chat actif et synchronisé !

### Synchronisation Temps Réel

Toutes ces fonctionnalités sont synchronisées en temps réel:
- ✅ Messages du chat
- ✅ Rapports et événements
- ✅ Statistiques
- ✅ Planification
- ✅ Notifications

---

## 🛠️ Technologies

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MySQL** - Base de données
- **Socket.io** - Temps réel WebSocket
- **JWT** - Authentification
- **Multer** - Upload de fichiers
- **PDFKit** - Génération PDF
- **Nodemailer** - Envoi d'emails

### Frontend React
- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Axios** - Client HTTP
- **Socket.io Client** - Temps réel

### Frontend PHP
- **PHP 8** - Backend web
- **Bootstrap 5** - Framework CSS
- **Vanilla JS** - JavaScript natif

### Mobile
- **React Native** - Framework mobile
- **Expo** - Outil de développement
- **React Navigation** - Navigation
- **Socket.io Client** - Temps réel

---

## 📁 Structure du Projet

```
ninjaguard/
├── backend/                 # Backend Node.js/Express (API unifiée)
│   ├── config/             # Configuration
│   ├── database/           # Schéma MySQL
│   ├── middleware/         # Middleware (auth, etc.)
│   ├── routes/             # Routes API
│   ├── socket/             # Socket.io (temps réel)
│   └── uploads/            # Fichiers uploadés
├── frontend/               # Frontend Web React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── contexts/       # Contexts (auth, etc.)
│   │   ├── pages/          # Pages de l'application
│   │   └── services/       # Services API
│   └── public/             # Assets statiques
├── php/                    # Frontend Web PHP (Bootstrap)
│   ├── api/                # API PHP (optionnel)
│   ├── config/             # Configuration
│   ├── database/           # Scripts base de données
│   ├── public/             # Fichiers publics
│   └── views/              # Vues PHP
├── NightWatchApp/          # Application Mobile React Native
│   ├── android/            # Configuration Android
│   ├── ios/                # Configuration iOS
│   └── src/                # Code source
├── docs/                   # Documentation
├── screenshots/            # Captures d'écran
├── start-all.sh            # Script de démarrage
├── stop-all.sh             # Script d'arrêt
└── README.md               # Ce fichier
```

---

## 🔧 Configuration

### Backend (.env)

```env
PORT=5000
DB_HOST=localhost
DB_NAME=nightwatch
DB_USER=root
DB_PASSWORD=
JWT_SECRET=votre-cle-secrete
FRONTEND_URL=http://localhost:5173
```

### Frontend React (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Frontend PHP (config.php)

```php
define('BACKEND_API_URL', 'http://localhost:5000/api');
```

### Mobile (.env)

```env
API_URL=http://10.0.2.2:5000/api
SOCKET_URL=http://10.0.2.2:5000
```

---

## 🚀 Déploiement

### Production

Voir le guide de déploiement dans [README-UNIFIED.md](README-UNIFIED.md#-déploiement-en-production).

### Docker

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Stop
docker-compose down
```

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📝 Changelog

### Version 1.0.0 (2024)
- ✅ Backend Node.js/Express complet
- ✅ Frontend Web React complet
- ✅ Frontend Web PHP complet
- ✅ Application Mobile React Native complète
- ✅ Intégration temps réel Socket.io
- ✅ Synchronisation multi-plateforme
- ✅ Documentation complète

---

## ❓ FAQ

### Q: Puis-je utiliser seulement une application ?
**R**: Oui ! Chaque application fonctionne indépendamment. Utilisez React Web, PHP Web, ou Mobile selon vos besoins.

### Q: Les données sont-elles synchronisées ?
**R**: Oui ! Toutes les applications partagent la même base de données et sont synchronisées en temps réel via Socket.io.

### Q: Puis-je utiliser les applications simultanément ?
**R**: Absolument ! Vous pouvez utiliser React Web, PHP Web et Mobile en même temps. Tout est synchronisé.

### Q: L'application mobile nécessite-t-elle internet ?
**R**: Oui, pour le moment l'application nécessite une connexion internet pour se synchroniser avec le backend. Un mode hors ligne est en développement.

---

## 🐛 Signalement de Bugs

Pour signaler un bug ou demander une fonctionnalité:

- GitHub Issues: https://github.com/vincentmichau/ninjaguard/issues
- Email: support@nightwatch.fr

---

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour les détails.

---

## 👥 Équipe

- **Développeur Principal**: NightWatch Team
- **Contributeurs**: Voir [CONTRIBUTORS.md](CONTRIBUTORS.md)

---

## 🙏 Remerciements

- Node.js et l'équipe Express
- React et l'équipe React Native
- La communauté Open Source

---

<div align="center">

**Créé avec ❤️ par NightWatch Team**

[⬆ Retour en haut](#-nightwatch---plateforme-de-gestion-de-rondes-de-nuit)

</div>