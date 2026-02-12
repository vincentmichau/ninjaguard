# Guide d'Utilisation - NightWatch

Guide complet pour l'utilisation de l'application NightWatch de rapports de veilleur de nuit.

---

## Table des Matières

1. [Introduction](#introduction)
2. [Première Connexion](#première-connexion)
3. [Dashboard](#dashboard)
4. [Gestion des Rapports](#gestion-des-rapports)
5. [Planning](#planning)
6. [Historique](#historique)
7. [Chat](#chat)
8. [Administration](#administration)
9. [Profil](#profil)
10. [Bonnes Pratiques](#bonnes-pratiques)

---

## Introduction

NightWatch est une application web conçue pour les veilleurs de nuit gérant plusieurs sites et clients. Elle permet de:

- Créer et gérer des rapports de veille détaillés
- Documenter les incidents et observations
- Gérer les photos preuves
- Consulter le planning de travail
- Communiquer via un chat intégré
- Générer des PDF automatiques
- Envoyer des emails de reporting

---

## Première Connexion

### Accéder à l'application

1. **Ouvrez votre navigateur web** (Chrome, Firefox, Edge, Safari)
2. **Naviguez vers** l'URL de l'application:
   - En développement: `http://localhost:5173`
   - En production: l'URL fournie par votre administrateur

### Formulaire de Connexion

**Description détaillée du formulaire:**

![Page de Connexion](docs/screenshots/login.png)

**Champs du formulaire:**

1. **Email** (Champ de texte obligatoire)
   - Saisissez votre adresse email professionnelle
   - Format: `votre.nom@entreprise.fr`
   - Validation: format email valide requis

2. **Mot de passe** (Champ de texte obligatoire)
   - Saisissez votre mot de passe
   - Masqué par défaut (points)
   - Minimum 8 caractères

3. **Bouton "Se connecter"**
   - Cliquez pour vous authentifier
   - Affiche "Connexion..." pendant le chargement
   - Redirige vers le Dashboard si succès

**Compte Admin par défaut:**
- Email: `admin@nightwatch.fr`
- Mot de passe: `Admin123!`
- ⚠️ **IMPORTANT**: Changez ce mot de passe immédiatement après la première connexion!

**Messages d'erreur:**
- "Identifiants invalides" → Vérifiez email et mot de passe
- "Compte désactivé" → Contactez votre administrateur
- "Erreur de connexion" → Vérifiez votre connexion internet

**Sécurité:**
- Connexion sécurisée via HTTPS en production
- Token JWT avec expiration
- Protection contre brute force
- Cryptage des mots de passe

---

## Dashboard

### Vue d'ensemble

Le Dashboard est votre page d'accueil personnalisée qui affiche un résumé de votre activité.

![Dashboard](docs/screenshots/dashboard.png)

### Sections du Dashboard

#### 1. Message de bienvenue
- Affiche: "Bonjour, [Prénom] 👋"
- Date du jour en français
- Heure actuelle

#### 2. Cartes de statistiques (Admin uniquement)

**Carte "Total Rapports"**
- Fond: Dégradé bleu primary
- Icône: Document
- Nombre total de rapports créés
- Statut en temps réel

**Carte "Validés"**
- Fond: Dégradé vert
- Icône: Check (Validation)
- Nombre de rapports validés
- Pourcentage de completion

**Carte "Événements"**
- Fond: Dégradé orange
- Icône: Triangle d'alerte
- Total des événements documentés
- Dernier événement affiché

**Carte "Utilisateurs"**
- Fond: Dégradé violet
- Icône: Tendance
- Nombre total d'utilisateurs actifs
- Nouveaux utilisateurs ce mois

#### 3. Quart de nuit du jour
- Affiché si vous avez un quart prévu aujourd'hui
- Informations affichées:
  - Nom du site
  - Heures de début et fin
  - Bouton "Créer un rapport"
- Style: Carte avec bordure gauche bleue

#### 4. Actions rapides

**Bouton "Nouveau Rapport"**
- Icône: Plus
- Action: Redirige vers le formulaire de création
- Hover: Fond change de couleur

**Bouton "Mon Planning"**
- Icône: Calendrier
- Action: Affiche le planning mensuel
- Hover: Fond change de couleur

**Bouton "Historique"**
- Icône: Horloge
- Action: Affiche l'historique des rapports
- Hover: Fond change de couleur

#### 5. Rapports récents
- Liste des 5 derniers rapports
- Pour chaque rapport:
  - Indicateur de statut (vert = validé, jaune = brouillon)
  - Nom du site
  - Date du rapport
  - Boutons d'action (Voir, Modifier, Supprimer, PDF)
- Lien "Voir tout" pour accéder à la liste complète

### Navigation latérale

**Menu principal:**
1. **Tableau de bord** (Icône: Dashboard)
2. **Rapports** (Icône: Document)
3. **Planning** (Icône: Calendrier)
4. **Historique** (Icône: Horloge)
5. **Chat** (Icône: Message)

**Menu administrateur (si admin):**
6. **Administration** (Icône: Shield)

**Menu utilisateur:**
- **Mon profil** (Icône: Settings)
- **Déconnexion** (Icône: Logout)

---

## Gestion des Rapports

### Liste des Rapports

![Liste des Rapports](docs/screenshots/reports.png)

**Fonctionnalités:**
- Affichage de tous les rapports
- Filtres par statut et date
- Recherche par nom de site ou date
- Actions sur chaque rapport

#### Filtres

**Barre de recherche:**
- Placeholder: "Rechercher un rapport..."
- Recherche instantanée
- Insensible à la casse

**Filtre par statut:**
- Menu déroulant avec options:
  - "Tous les statuts"
  - "Brouillons" (en cours)
  - "Validés" (terminés)

**Actions de filtre:**
- Bouton "Filtrer" (Icône: Filter)
- Bouton "Réinitialiser" pour effacer les filtres

#### Carte de rapport

**Informations affichées:**
1. **Indicateur de statut** (cercle coloré)
   - Vert: Validé
   - Jaune: Brouillon

2. **Icône principale**
   - Check: Validé
   - Document: Brouillon

3. **Nom du site**
   - Texte en gras
   - Taille: grande

4. **Badge de statut**
   - Fond vert avec texte blanc si validé
   - Fond jaune avec texte noir si brouillon

5. **Date et horaires**
   - Date complète en français
   - Heure de début et fin
   - Météo et température si disponibles

6. **Boutons d'action:**
   - 👁️ **Voir**: Affiche les détails du rapport
   - ✏️ **Modifier**: Modifie le rapport (brouillons uniquement)
   - 📥 **Télécharger PDF**: Génère et télécharge le PDF (validés uniquement)
   - 🗑️ **Supprimer**: Supprime le rapport (brouillons uniquement)

#### État vide
- Affiché si aucun rapport ne correspond aux filtres
- Message explicatif
- Bouton pour créer un nouveau rapport si aucun rapport existe

### Création d'un Rapport

![Formulaire de Création](docs/screenshots/report-form.png)

#### Section 1: Informations générales

**Champ "Site"** (Menu déroulant obligatoire)
- Liste tous les sites configurés
- Affiche: Nom - Ville
- Sélection obligatoire

**Champ "Date"** (Date picker obligatoire)
- Calendrier interactif
- Date par défaut: aujourd'hui
- Format: JJ/MM/AAAA

**Champ "Heure début"** (Time picker obligatoire)
- Format: HH:MM
- Défaut: 20:00
- Picker horaire interactif

**Champ "Heure fin"** (Time picker obligatoire)
- Format: HH:MM
- Défaut: 06:00
- Picker horaire interactif

**Champ "Météo"** (Menu déroulant optionnel)
- Options:
  - Ensoleillé
  - Nuageux
  - Pluvieux
  - Neige
  - Brouillard

**Champ "Température"** (Nombre optionnel)
- Unité: °C
- Décimales acceptées
- Placeholder: "20"

**Zone "Notes générales"** (Textarea optionnel)
- Placeholder: "Ajoutez vos notes générales ici..."
- 4 lignes visibles
- Extension possible

#### Section 2: Événements

**Formulaire d'ajout d'événement**

**Champ "Type"** (Menu déroulant)
- Options:
  - Observation (par défaut)
  - Incident
  - Ronde
  - Autre

**Champ "Titre"** (Texte)
- Placeholder: "Titre de l'événement"
- Obligatoire pour l'ajout

**Champ "Heure"** (Datetime-local)
- Par défaut: heure actuelle
- Format: JJ/MM/AAAA HH:MM

**Champ "Lieu"** (Texte)
- Placeholder: "Lieu de l'événement"
- Optionnel

**Champ "Sévérité"** (Menu déroulant)
- Options:
  - Faible (par défaut)
  - Moyenne
  - Élevée
  - Critique

**Zone "Description"** (Textarea)
- Placeholder: "Description de l'événement"
- 3 lignes visibles
- Optionnel

**Zone "Action prise"** (Textarea)
- Placeholder: "Actions prises suite à l'événement"
- 2 lignes visuelles
- Optionnel

**Bouton "Ajouter l'événement"**
- Action: Ajoute à la liste
- Icône: Plus
- Validation: Titre requis

**Liste des événements**

Pour chaque événement ajouté:
1. **Badge de type** (coloré)
   - Incident: Rouge
   - Observation: Bleu
   - Ronde: Vert
   - Autre: Gris

2. **Titre** (en gras)
3. **Heure et lieu**
4. **Description** (si fournie)
5. **Action prise** (si fournie)
6. **Bouton Supprimer** (X rouge)

#### Section 3: Photos

**Zone d'upload**
- Bordure pointillée
- Message: "Cliquez pour ajouter des photos"
- Icône: Appareil photo
- Formats acceptés: PNG, JPG, GIF, WEBP
- Taille max: 10MB par photo
- Upload multiple possible

**Galerie de photos**
- Grille de 3 colonnes
- Miniatures carrées
- Hover: Opacité réduite
- Bouton Supprimer visible au hover (croix rouge)

#### Section 4: Actions (Sidebar)

**Bouton "Enregistrer brouillon"**
- Style: Secondaire (gris)
- Icône: Disquette
- Action: Sauvegarde sans validation
- Message de succès: "Rapport enregistré"

**Bouton "Valider le rapport"**
- Style: Primaire (bleu)
- Icône: Envoyer
- Action: Valide et verrouille le rapport
- Disponible: Admin et Superviseur uniquement
- Message de succès: "Rapport validé"

**Informations méta**
- Veilleur: Nom complet
- Date création: Date actuelle

### Consultation d'un Rapport

![Vue d'un Rapport](docs/screenshots/report-view.png)

#### En-tête

**Bouton Retour**
- Texte: "← Retour aux rapports"
- Action: Redirige vers la liste

**Titre**
- Nom du site
- Taille: 3xl (très grand)

**Date**
- Date complète en français
- Format: "jour mois année"

**Boutons d'action**
- 📥 **Télécharger PDF**: Génère le PDF (rapports validés)
- ✉️ **Envoyer par email**: Envoie aux destinataires (admin)
- ✏️ **Modifier**: Modifie le rapport (brouillons)

#### Badge de statut
- Vert avec texte blanc: "✓ Rapport validé"
- Jaune avec texte noir: "Brouillon"

#### Informations

**Grille d'informations:**
1. **Horaires** (Icône: Horloge)
   - Heure de début et fin
   - Format: HH:MM

2. **Météo** (Icône: Nuage)
   - Condition météo
   - Affiché si renseigné

3. **Température** (Icône: Thermomètre)
   - Valeur en °C
   - Affichée si renseignée

4. **Veilleur**
   - Nom et prénom
   - Texte normal

**Notes générales**
- Section séparée avec bordure
- Titre en gras
- Texte des notes

#### Événements

**Liste des événements**

Pour chaque événement:
1. **Icône de type**
   - Incident: Triangle rouge
   - Observation: Check bleu
   - Ronde: Pin vert
   - Autre: Triangle gris

2. **Titre**
   - Numéroté (1., 2., 3.)
   - En gras

3. **Badge de sévérité**
   - Critique: Rouge
   - Élevée: Orange
   - Moyenne: Jaune
   - Faible: Vert

4. **Heure et lieu**
   - Date/heure complète
   - Lieu si renseigné

5. **Description**
   - Texte descriptif
   - Si renseignée

6. **Action prise**
   - Fond bleu clair
   - Titre: "Action prise:"
   - Texte en bleu

#### Photos

**Galerie**
- Titre: "Photos (X)"
- Grille de 2-3 colonnes
- Images rectangulaires (48px de haut)
- Cursor: Pointeur
- Hover: Opacité 90%
- Click: Ouvre en nouvel onglet
- Badge sur chaque photo:
  - Fond: Noir semi-transparent
  - Texte: Nom du fichier
  - Icône: Appareil photo

#### Sidebar

**Validation Info** (si validé)
- Fond: Vert clair
- Bordure: Vert
- Icône: Check vert
- Titre: "Validé"
- Par: Nom du validateur
- Le: Date/heure de validation

**Site Info**
- Nom du site
- Adresse (si renseignée)
- Ville (si renseignée)

**Métadonnées**
- Créé le: Date/heure
- Modifié le: Date/heure (si modifié)

---

## Planning

![Planning](docs/screenshots/planning.png)

### Vue calendrier

#### Navigation
- **Bouton Mois précédent** (Icône: Flèche gauche)
- **Titre du mois** (ex: "Janvier 2024")
- **Bouton Mois suivant** (Icône: Flèche droite)

#### Calendrier

**Jours de la semaine**
- En-têtes: Dim, Lun, Mar, Mer, Jeu, Ven, Sam
- Gras
- Gris foncé

**Cases de jour**
- Taille minimale: 100px
- Bordure arrondie
- Fond: Blanc (gris si aujourd'hui)
- Numéro du jour en gras
- Highlight bleu si aujourd'hui

**Événements (quarts)**
- Cartes colorées
- Font: Extra small
- Padding: 2px
- Marges: 4px entre événements
- Arrondi
- Contenu:
  - Nom du site (gras, tronqué)
  - Heure (Icône: Horloge + HH:MM)

**Codes couleur:**
- Bleu: Prévu
- Vert: Terminé
- Rouge: Absent

### Export iCalendar

**Bouton "Exporter iCal"**
- Icône: Télécharger
- Action: Génère fichier .ics
- Compatible: Outlook, Google Calendar, Apple Calendar
- Message: "Export iCalendar en cours"

### Prochains quarts

**Liste des 5 prochains quarts**
- Cartes avec hover effect
- Pour chaque quart:
  - Icône: Calendrier (fond bleu)
  - Nom du site (gras)
  - Date complète
  - Horaires
  - Badge de statut

**État vide**
- Icône: Calendrier (gris)
- Message: "Aucun quart prévu pour ce mois"
- Texte gris

---

## Historique

![Historique](docs/screenshots/history.png)

### Filtres

**Recherche**
- Placeholder: "Rechercher..."
- Recherche par: site, date
- Instantanée

**Date de début**
- Date picker
- Filtre les rapports après cette date

**Date de fin**
- Date picker
- Filtre les rapports avant cette date

**Filtre statut**
- Tous
- Brouillons
- Validés

**Boutons**
- "Filtrer" (Icône: Filter)
- "Réinitialiser"

### Résultats

**Compteur**
- Texte: "X rapport(s) trouvé(s)"

**Liste des rapports**
- Même format que liste des rapports
- Tri chronologique inverse
- Pagination future

---

## Chat

![Chat](docs/screenshots/chat.png)

### Interface

#### Sidebar - Conversations

**Recherche**
- Placeholder: "Rechercher..."
- Recherche conversations

**Messages directs**
- Titre: "Messages directs" (petit, gris)
- Liste des conversations
- Pour chaque conversation:
  - Avatar: Initiales (fond bleu)
  - Nom complet
  - Dernier message (heure)

**Groupes**
- Titre: "Groupes" (petit, gris)
- Liste des groupes
- Pour chaque groupe:
  - Icône: Users (fond bleu)
  - Nom du groupe
  - Description (si existante)

#### Zone de chat

**En-tête**
- Nom de la conversation
- Type: "Message privé" ou "Groupe"
- Bouton "..." (options)

**Messages**
- Scroll vertical
- Espace entre messages
- Propres: Droite, fond bleu, texte blanc
- Reçus: Gauche, fond gris, texte noir
- Pour chaque message:
  - Expéditeur (si groupe)
  - Contenu
  - Heure + icône lu (si envoyé)

**Saisie**
- Input: "Écrivez votre message..."
- Bouton Envoyer (Icône: Send)
- Enter: Envoie

**État vide**
- Icône: Message (gris)
- Texte: "Sélectionnez une conversation pour commencer"

---

## Administration

![Administration](docs/screenshots/admin.png)

### Navigation par onglets

1. **Statistiques** (Icône: Trending Up)
2. **Utilisateurs** (Icône: Users)
3. **Sites** (Icône: Building)
4. **Clients** (Icône: Settings)
5. **Emails** (Icône: Mail)

### Statistiques

**Cartes métriques**
- Utilisateurs: Fond violet
- Sites: Fond bleu
- Rapports: Fond vert
- Événements: Fond orange

### Utilisateurs

**Tableau**
- Colonnes: Nom, Email, Rôle, Statut, Actions
- Badges:
  - Admin: Violet
  - Supervisor: Bleu
  - Watcher: Gris
  - Actif: Vert
  - Inactif: Rouge
- Actions:
  - Modifier (Icône: Edit)
  - Supprimer (Icône: Trash)

**Bouton "Ajouter"**
- Icône: Plus
- Modal de création

### Sites

**Liste**
- Cartes avec fond gris
- Nom du site
- Ville et code postal
- Actions: Modifier, Supprimer

**Bouton "Ajouter"**
- Icône: Plus
- Formulaire de création

### Clients

**Liste**
- Cartes avec fond gris
- Nom et société
- Email
- Actions: Modifier

**Bouton "Ajouter"**
- Icône: Plus
- Formulaire de création

### Emails

**Liste**
- Cartes avec fond gris
- Nom et email
- Site associé
- Actions: Supprimer

**Bouton "Ajouter"**
- Icône: Plus
- Formulaire de création

---

## Profil

![Profil](docs/screenshots/profile.png)

### Informations personnelles

**Formulaire**
- Prénom (texte)
- Nom (texte)
- Email (disabled, gris)
- Téléphone (texte)

**Bouton "Enregistrer"**
- Icône: Save
- Primaire

### Changement mot de passe

**Formulaire**
- Mot de passe actuel (password)
- Nouveau mot de passe (password, min 8)
- Confirmer (password)

**Bouton "Changer"**
- Icône: Save
- Danger (rouge)

---

## Bonnes Pratiques

### Pour les veilleurs

1. **Sauvegarde régulière**
   - Enregistrez votre brouillon toutes les 30 minutes
   - Utilisez le bouton "Enregistrer brouillon"

2. **Documentation détaillée**
   - Soyez précis dans les descriptions d'événements
   - Incluez l'heure exacte
   - Précisez le lieu

3. **Photos**
   - Prenez des photos claires
   - Ajoutez des descriptions
   - Uploadez rapidement après l'événement

4. **Validation**
   - Relisez avant de valider
   - Vérifiez toutes les informations
   - Un rapport validé ne peut plus être modifié

### Pour les administrateurs

1. **Gestion des utilisateurs**
   - Créez des comptes pour tous les veilleurs
   - Attribuez les bons rôles
   - Désactivez les comptes inutilisés

2. **Configuration**
   - Ajoutez tous les sites et clients
   - Configurez les destinataires d'emails
   - Importez le planning régulièrement

3. **Sécurité**
   - Changez le mot de passe admin
   - Surveillez les logs d'audit
   - Faites des backups réguliers

4. **Communication**
   - Validez les rapports rapidement
   - Envoyez les rapports aux clients
   - Répondez aux questions des utilisateurs

---

## Support

Pour toute question ou problème:
- 📧 Email: support@nightwatch.fr
- 📚 Documentation: https://docs.nightwatch.fr
- 🐛 Issues: https://github.com/nightwatch/issues

---

**© 2024 NightWatch - Tous droits réservés**