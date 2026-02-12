# NightWatch - Système de Gestion de Gardes de Nuit

Application complète de gestion et de reporting pour les services de garde de nuit.

## 📱 NightWatch Android Application

Application mobile Android complète pour le système de reporting NightWatch.

### ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** - Connexion JWT avec gestion de session
- 📊 **Tableau de bord** - Statistiques en temps réel et actions rapides
- 📝 **Gestion des rapports** - Création, édition, validation de rapports
- 🚨 **Suivi des événements** - Incidents et observations avec niveaux de gravité
- 📷 **Gestion des photos** - Capture et upload via caméra/galerie
- 📅 **Planning** - Calendrier de travail avec export iCal
- 📜 **Historique** - Recherche avancée et filtrage
- 💬 **Chat en temps réel** - Messagerie instantanée avec Socket.io
- ⚙️ **Panneau admin** - Gestion complète (utilisateurs, sites, clients)
- 📄 **Export PDF** - Téléchargement des rapports en PDF
- 📧 **Email** - Envoi des rapports par email

### 🎨 Captures d'Écran

Voir le dossier `screenshots/` pour 10 captures d'écran haute résolution de l'application.

### 🚀 Installation

#### Prérequis
- Node.js 20+
- Java JDK 11+
- Android Studio avec SDK Android
- SDK Android API Level 33+

#### Installation Rapide

```bash
# Cloner le dépôt
git clone https://github.com/vincentmichau/ninjaguard.git
cd ninjaguard

# Installer les dépendances
cd NightWatchApp
npm install --legacy-peer-deps

# Configurer l'environnement
# Éditer .env et définir API_URL et SOCKET_URL

# Lancer l'application
npm start
npm run android
```

#### Construire l'APK

```bash
# Utiliser le script de build
./build-apk.sh

# Ou manuellement
cd android
./gradlew assembleRelease
```

L'APK sera disponible dans `android/app/build/outputs/apk/release/app-release.apk`

### 📦 Contenu du Package

**Application Android:**
- Code source React Native complet
- 10 écrans fonctionnels
- Services API pour le backend
- Configuration Android prête pour production

**Captures d'écran:**
- 10 images haute résolution (1536x1024)
- Documentation complète
- Prêtes pour présentations et marketing

### 🔐 Identifiants par Défaut

- **Email**: admin@nightwatch.fr
- **Mot de passe**: Admin123!

### 📚 Documentation

- `NightWatchApp/ANDROID_GUIDE.md` - Guide utilisateur complet
- `NightWatchApp/README.md` - Documentation technique
- `screenshots/README.md` - Description des captures d'écran

### 🎯 Rôles Utilisateurs

- **Admin**: Accès complet et gestion du système
- **Superviseur**: Validation et supervision des rapports
- **Veilleur**: Création et gestion des rapports

### 🛠️ Stack Technologique

- **Framework**: React Native 0.84.0
- **Navigation**: React Navigation (Stack + Tabs)
- **État**: React Context API
- **HTTP**: Axios
- **Temps Réel**: Socket.io
- **Stockage**: AsyncStorage
- **Icônes**: react-native-vector-icons

### 📱 Configuration App

- **Package**: com.nightwatchapp
- **Version**: 1.0.0
- **Min SDK**: 21 (Android 5.0)
- **Target SDK**: 34 (Android 14)

### 🔧 Dépannage

**Metro bundler ne démarre pas:**
```bash
npx react-native start --reset-cache
```

**Erreurs de build:**
```bash
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install --legacy-peer-deps
```

**Problèmes de connexion API:**
- Vérifier que le backend est en cours d'exécution
- Vérifier API_URL dans .env
- Pour émulateur: utiliser `10.0.2.2`
- Pour appareil: utiliser IP locale du serveur

### 📄 Licence

Copyright © 2024 NightWatch. Tous droits réservés.

### 📞 Support

Pour le support technique, consultez la documentation ou contactez l'équipe de développement.

---

**Note**: Cette application est prête pour la production. Assurez-vous d'avoir le serveur backend NightWatch en cours d'exécution avant d'utiliser l'application.