# Guide d'Utilisation - NightWatch

## Table des matières

1. [Introduction](#introduction)
2. [Connexion](#connexion)
3. [Tableau de bord](#tableau-de-bord)
4. [Gestion des rapports](#gestion-des-rapports)
5. [Administration](#administration)
6. [Chat](#chat)
7. [Planification](#planification)
8. [Profil utilisateur](#profil-utilisateur)

---

## Introduction

NightWatch est une application de gestion de rondes de nuit professionnelle qui permet de :
- Créer et gérer des rapports de ronde
- Suivre les incidents et observations
- Valider les rapports
- Communiquer avec l'équipe
- Planifier les rondes

---

## Connexion

### Accéder à l'application

1. Ouvrez votre navigateur web
2. Allez à l'URL de l'application (ex: `http://localhost:8000`)
3. Vous serez redirigé vers la page de connexion

### Se connecter

1. Entrez votre **email**
2. Entrez votre **mot de passe**
3. Cliquez sur le bouton **"Se connecter"**

**Compte par défaut** :
- Email : `admin@nightwatch.fr`
- Mot de passe : `Admin123!`

### Déconnexion

Pour vous déconnecter :
1. Cliquez sur votre nom en haut à droite
2. Sélectionnez **"Déconnexion"** dans le menu

---

## Tableau de bord

### Vue d'ensemble

Le tableau de bord vous donne un aperçu rapide de votre activité :
- **Statistiques** : nombre total de rapports, rapports validés, incidents, alertes
- **Actions rapides** : accès direct aux fonctions principales
- **Rapports récents** : liste des derniers rapports créés

### Actions rapides

- **Créer un nouveau rapport** : Ouvre le formulaire de création
- **Voir tous les rapports** : Accède à la liste complète
- **Consulter l'historique** : Voir les rapports avec filtres avancés

---

## Gestion des rapports

### Liste des rapports

Accédez à la liste via le menu **"Rapports"**.

#### Filtres disponibles

- **Site** : Filtrer par site spécifique
- **Statut** : Normal, Incident, Alerte
- **Validé** : Rapports validés ou non
- **Recherche** : Rechercher par texte

#### Actions possibles

- **Voir** : Consulter les détails d'un rapport
- **Modifier** : Modifier un rapport non validé
- **Supprimer** : Supprimer un rapport (seul l'auteur peut supprimer)

### Créer un rapport

1. Cliquez sur **"Nouveau Rapport"** dans le menu
2. Remplissez les informations générales :
   - **Site** : Sélectionnez le site (obligatoire)
   - **Date du rapport** : Date de la ronde (obligatoire)
   - **Type de poste** : Nuit, Matin, Après-midi, Soir (obligatoire)
   - **Heure de début** : Heure de début de la ronde (obligatoire)
   - **Heure de fin** : Heure de fin de la ronde

3. Remplissez les conditions météo (optionnel) :
   - **Météo** : Ensoleillé, Nuageux, Pluvieux, etc.
   - **Température** : Température en degrés Celsius

4. Définissez le statut général :
   - **Statut** : Normal, Incident, Alerte
   - **Photos** : Ajoutez des photos (max 5 Mo par photo)
   - **Notes générales** : Ajoutez vos observations

5. Ajoutez des événements/incidents :
   - Cliquez sur **"Ajouter un événement"**
   - **Type** : Incident, Observation, Intervention, Autre
   - **Titre** : Titre de l'événement (obligatoire)
   - **Gravité** : Faible, Moyen, Élevé, Critique
   - **Heure** : Heure de l'événement (obligatoire)
   - **Description** : Description détaillée

6. Cliquez sur **"Enregistrer le rapport"**

### Voir un rapport

1. Cliquez sur l'icône **œil** dans la liste des rapports
2. Vous verrez toutes les informations :
   - Informations générales (site, date, poste)
   - Informations sur l'agent
   - Conditions météo
   - Photos attachées
   - Notes générales
   - Événements/incidents
   - Statut de validation

#### Actions sur un rapport

- **Modifier** : Si le rapport n'est pas validé
- **Valider** : Pour valider le rapport (réservé aux admins/superviseurs)
- **PDF** : Générer un PDF (fonctionnalité à venir)

### Valider un rapport

Les rapports doivent être validés par un superviseur ou administrateur :

1. Ouvrez le rapport à valider
2. Cliquez sur le bouton **"Valider"**
3. Confirmez la validation
4. Le rapport ne pourra plus être modifié

⚠️ **Important** : Une fois validé, un rapport ne peut plus être modifié ni supprimé.

---

## Administration

### Accès au panneau admin

Le panneau d'administration est accessible aux **administrateurs** et **superviseurs**.

### Tableau de bord admin

Vue d'ensemble avec :
- Nombre d'utilisateurs
- Nombre de sites
- Nombre de clients
- Nombre de rapports
- Répartition par rôle

### Gestion des utilisateurs (Admin uniquement)

#### Liste des utilisateurs

Voir tous les utilisateurs avec :
- Nom et email
- Rôle (Admin, Superviseur, Veilleur)
- Statut (Actif/Inactif)

#### Créer un utilisateur

1. Cliquez sur **"Nouvel Utilisateur"**
2. Remplissez le formulaire :
   - **Email** : (obligatoire)
   - **Mot de passe** : Minimum 8 caractères (obligatoire)
   - **Prénom** : (obligatoire)
   - **Nom** : (obligatoire)
   - **Rôle** : Veilleur, Superviseur, Administrateur
3. Cliquez sur **"Créer"**

#### Modifier un utilisateur

Cliquez sur l'icône **crayon** dans la liste des utilisateurs.

#### Supprimer un utilisateur

⚠️ **Attention** : Supprimer un utilisateur supprime aussi tous ses rapports.

### Gestion des sites (Admin uniquement)

#### Liste des sites

Voir tous les sites avec :
- Nom du site
- Client associé
- Ville
- Statut (Actif/Inactif)

#### Créer un site

1. Cliquez sur **"Nouveau Site"**
2. Remplissez le formulaire :
   - **Client** : Sélectionnez le client (obligatoire)
   - **Nom du site** : (obligatoire)
   - **Adresse** : (obligatoire)
   - **Ville** : (optionnel)
   - **Code postal** : (optionnel)
   - **Instructions spéciales** : Notes pour les veilleurs

### Gestion des clients (Admin uniquement)

#### Liste des clients

Voir tous les clients avec :
- Nom du client
- Contact principal
- Email
- Téléphone

#### Créer un client

1. Cliquez sur **"Nouveau Client"**
2. Remplissez le formulaire :
   - **Nom** : (obligatoire)
   - **Adresse** : (optionnel)
   - **Contact principal** : (optionnel)
   - **Email** : (optionnel)
   - **Téléphone** : (optionnel)

### Paramètres

Page d'information sur la configuration de l'application :
- Configuration de la base de données
- Configuration de l'application
- Version et dernière mise à jour

---

## Chat

### Accéder au chat

Cliquez sur **"Chat"** dans le menu principal.

### Utiliser le chat

Le chat permet de communiquer avec l'équipe en temps réel :

#### Conversations

- **Général** : Chat de l'équipe entière
- **Équipe de nuit** : Chat spécifique aux équipes de nuit
- Vous pouvez créer des conversations personnalisées

#### Envoyer un message

1. Sélectionnez une conversation
2. Tapez votre message dans le champ de texte
3. Cliquez sur **"Envoyer"** ou appuyez sur Entrée

#### Messages

- Messages envoyés : alignés à droite (bleu)
- Messages reçus : alignés à gauche (blanc)
- Chaque message affiche l'expéditeur et l'heure

---

## Planification

### Accéder à la planification

Cliquez sur **"Planification"** dans le menu principal.

### Calendrier mensuel

Le calendrier affiche toutes les rondes du mois :
- Navigation entre les mois (flèches)
- Cliquez sur un jour pour ajouter une ronde
- Les rondes sont affichées sur les jours correspondants

### Liste des rondes du mois

Tableau récapitulatif des rondes avec :
- Date
- Site
- Heure
- Agent
- Statut (Planifié, En cours, Terminé, Annulé)

### Ajouter une ronde

1. Cliquez sur un jour du calendrier ou sur **"Ajouter une ronde"**
2. Remplissez le formulaire :
   - **Site** : (obligatoire)
   - **Date** : (obligatoire)
   - **Heure de début** : (obligatoire)
   - **Heure de fin** : (optionnel)
   - **Notes** : Instructions ou remarques
3. Cliquez sur **"Ajouter"**

### Exporter iCal

Cliquez sur **"Exporter iCal"** pour télécharger le calendrier au format iCal (compatible avec Outlook, Google Calendar, etc.).

⚠️ **Note** : Cette fonctionnalité est en cours de développement.

---

## Profil utilisateur

### Accéder à votre profil

1. Cliquez sur votre nom en haut à droite
2. Sélectionnez **"Mon Profil"**

### Informations personnelles

Voir vos informations :
- Nom complet
- Email
- Téléphone
- Rôle
- Date de création du compte
- Statut du compte

### Changer le mot de passe

1. Entrez votre **nouveau mot de passe** (minimum 8 caractères)
2. Confirmez le mot de passe
3. Cliquez sur **"Changer le mot de passe"**

⚠️ **Important** : Utilisez un mot de passe fort avec :
- Au moins 8 caractères
- Des majuscules et minuscules
- Des chiffres
- Des caractères spéciaux

---

## Rôles et permissions

### Administrateur

Accès complet à l'application :
- Gestion des utilisateurs
- Gestion des sites
- Gestion des clients
- Validation des rapports
- Suppression de rapports
- Accès à toutes les fonctions

### Superviseur

Accès étendu :
- Validation des rapports
- Gestion limitée
- Accès à la planification
- Chat complet

### Veilleur

Accès utilisateur :
- Création de rapports
- Modification de ses rapports non validés
- Consultation des rapports
- Chat
- Profil

---

## Bonnes pratiques

### Création de rapports

1. **Soyez précis** dans vos descriptions
2. **Prenez des photos** des incidents ou zones problématiques
3. **Notez les heures exactes** des événements
4. **Utilisez les niveaux de gravité** appropriés
5. **Remplissez toutes les sections obligatoires**

### Sécurité

1. **Changez votre mot de passe** régulièrement
2. **Ne partagez pas vos identifiants**
3. **Déconnectez-vous** après chaque session
4. **Signalez** tout problème de sécurité à l'administrateur

### Communication

1. **Utilisez le chat** pour communiquer avec l'équipe
2. **Soyez professionnel** dans vos messages
3. **Informez rapidement** en cas d'incident
4. **Documentez** les décisions importantes dans les rapports

---

## Dépannage

### Problèmes de connexion

- Vérifiez votre email et mot de passe
- Assurez-vous que votre compte est actif
- Contactez l'administrateur si le problème persiste

### Rapport qui ne s'enregistre pas

- Vérifiez que tous les champs obligatoires sont remplis
- Vérifiez que les photos font moins de 5 Mo
- Essayez de rafraîchir la page

### Impossible de valider un rapport

- Vérifiez que vous avez les droits de superviseur ou admin
- Le rapport doit être complété avant validation
- Contactez l'administrateur si nécessaire

---

## Support

Pour toute question ou problème :
- Email : support@nightwatch.fr
- Consultez le README technique pour les administrateurs

---

**Version** : 1.0.0  
**Dernière mise à jour** : <?php echo date('d/m/Y'); ?>