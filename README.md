# Pambe - Plateforme de Mise en Relation de Services

Bienvenue sur Pambe ! Ce projet vise à créer une plateforme robuste pour connecter les prestataires de services et les clients au Cameroun, en facilitant la recherche, la réservation et le paiement sécurisé des services.

## Objectif

L'application Pambe a pour but de permettre aux individus et petites entreprises camerounaises de monétiser leurs compétences (plomberie, maçonnerie, cours de soutien, travaux champêtres, etc.) en les rendant visibles et accessibles à des clients potentiels. Pour les clients, Pambe offre un moyen simple et fiable de trouver des prestataires qualifiés en fonction de leurs besoins spécifiques, de leur localisation et des évaluations d'autres utilisateurs.

## Tech Stack

* **Backend :**
    * Framework : [NestJS](https://nestjs.com/) (Node.js, TypeScript)
    * Base de données : [PostgreSQL](https://www.postgresql.org/)
    * ORM : TypeORM
* **Frontend :**
    * Framework : [React](https://reactjs.org/) avec [TypeScript](https://www.typescriptlang.org/) (ReactTS)
    * Gestion d'état : Zustand
    * Styling : Tailwind CSS (ou Material-UI, à confirmer)
* **Paiements :** Intégration avec Orange Money et MTN Mobile Money

## Structure du Projet

Le projet est organisé comme suit :
```
pambe/
├── backend/         # Code source du backend NestJS
│   ├── src/
│   ├── test/
│   ├── .env.example
│   ├── Dockerfile
│   └── ...
├── frontend/        # Code source du frontend ReactTS
│   ├── public/
│   ├── src/
│   ├── .env.example
│   └── ...
├── docs/            # Documentation du projet
│   ├── database.sql # Script de création de la base de données PostgreSQL
│   ├── api_docs.md  # (À créer) Documentation de l'API (Swagger/OpenAPI)
│   └── design_docs/ # (À créer) Maquettes, diagrammes d'architecture, etc.
└── README.md        # Ce fichier
```

## Fonctionnalités Clés

* **Authentification :** Inscription/connexion sécurisée (email/téléphone + mot de passe, OTP, OAuth2 avec Google, Facebook, Apple), gestion des rôles (Client, Prestataire, Admin).
* **Gestion des Profils :** Profils détaillés pour prestataires (compétences, expérience, portfolio, zones de service) et clients.
* **Publication et Recherche de Services :** Les prestataires publient leurs offres ; les clients recherchent avec des filtres (catégorie, localisation, prix, évaluations).
* **Réservations :** Système de demande, d'acceptation/refus, et de confirmation des réservations.
* **Messagerie Intégrée :** Chat entre clients et prestataires pour discuter des détails d'un service.
* **Paiements Sécurisés :** Intégration avec les solutions Mobile Money locales (paiement après service, gestion des commissions).
* **Évaluations et Réputation :** Les clients notent et commentent les services ; les prestataires peuvent répondre.
* **Administration :** Tableau de bord pour la gestion des utilisateurs, services, transactions, litiges et paramètres de la plateforme.
* **Notifications :** Alertes en temps réel (in-app, SMS, email) pour les actions importantes.
* **Bilinguisme :** Interface disponible en Français et en Anglais.
* **Optimisation :** Conçue pour fonctionner efficacement même avec des connexions internet lentes.

## Base de Données

Le schéma de la base de données PostgreSQL est défini dans le fichier `docs/database.sql`.
Les entités principales (tables) sont nommées en français et incluent :
`Villes`, `Quartiers`, `Utilisateurs`, `ProfilsPrestataires`, `Competences`, `CompetencesPrestataires`, `Services`, `Reservations`, `Transactions`, `Avis`, `Messages`, `Portfolio`, et `JetonsAuthentification`.
Chaque table est conçue pour stocker des informations spécifiques et les relations entre elles assurent l'intégrité et la cohérence des données. Par exemple, `Utilisateurs` stocke les informations des utilisateurs, tandis que `Services` détaille les offres des prestataires, avec des liens vers les compétences et les profils appropriés. La table `JetonsAuthentification` est utilisée pour gérer différents types de jetons liés à la sécurité des comptes utilisateurs (jetons de rafraîchissement, de réinitialisation de mot de passe, etc.).

## Démarrage Rapide (Instructions Générales)

### Prérequis

* [Node.js](https://nodejs.org/) (version LTS recommandée)
* [Yarn](https://yarnpkg.com/) ou Npm
* [PostgreSQL](https://www.postgresql.org/download/) (Serveur actif)
* [Git](https://git-scm.com/)

### Backend (`pambe/backend/`)

1.  **Cloner le dépôt** (si ce n'est pas déjà fait) et naviguer vers `pambe/backend/`.
2.  **Installer les dépendances :**
    ```bash
    npm install
    ```
3.  **Configuration de l'environnement :**
    * Copier `.env.example` vers `.env`.
    * Configurer les variables d'environnement dans `.env` (accès base de données, clés API, secrets JWT, configurations OAuth, etc.).
4.  **Base de données :**
    * Assurez-vous que votre serveur PostgreSQL est en cours d'exécution.
    * Créez une base de données pour le projet (par exemple, `pambe`).
    * Exécutez le script `docs/database.sql` pour créer les tables et les types nécessaires.
5.  **Lancer l'application en mode développement :**
    ```bash
    npm run start:dev
    ```
    Le backend devrait être accessible sur `http://localhost:PORT_BACKEND` (défini dans `.env`, souvent 3000 ou 3001).

### Frontend (`pambe/frontend/`)

1.  **Naviguer vers `pambe/frontend/`.**
2.  **Installer les dépendances :**
    ```bash
    npm install
    ```
3.  **Configuration de l'environnement :**
    * Copier `.env.example` (ou `.env.local.example`) vers `.env.local`.
    * Configurer les variables d'environnement (ex: URL de l'API backend `VITE_API_URL`).
4.  **Lancer l'application en mode développement :**
    ```bash
    npm run start
    ```
    Le frontend devrait être accessible sur `http://localhost:PORT_FRONTEND` (souvent 3000 si le backend tourne sur un autre port, ou 3002).

## Contribution

Les contributions sont les bienvenues ! Si vous souhaitez contribuer à Pambe, veuillez suivre ces étapes :

1.  **Forker le dépôt.**
2.  **Créer une nouvelle branche** pour votre fonctionnalité ou correction de bug : `git checkout -b feature/nom-de-la-feature` ou `git checkout -b fix/description-du-bug`.
3.  **Effectuer vos modifications** en respectant les standards de codage du projet
4.  **Écrire des tests** pour vos nouvelles fonctionnalités ou corrections.
5.  **Soumettre une Pull Request (PR)** vers la branche  `main` du dépôt original.
6.  Assurez-vous que votre PR décrit clairement les changements apportés et pourquoi.

Nous examinerons votre PR dès que possible.

## Axes d'Amélioration Futurs

* Système de géolocalisation avancé (recherche par rayon, affichage sur carte avec PostGIS).
* Notifications Push pour les applications mobiles (futures).
* Tableau de bord analytique plus poussé pour les administrateurs et les prestataires.
* Programme de fidélité ou de parrainage.
* Internationalisation plus poussée des contenus (au-delà de l'interface).

## Contact

Mail: [legrandpone1@gmail.com](mailto:legrandpone1@gmailcom)
