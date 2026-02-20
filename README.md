# RhumatoAI 🏥

**Assistant IA pour la Rhumatologie** — CHU Ibn Rochd, Casablanca

> Projet de Fin d'Études | Février – Juillet 2026  
> Superviseur : Prof. Samy Housbane

---

## Description

Système d'intelligence artificielle **local** pour assister les rhumatologues dans l'analyse et la synthèse des dossiers médicaux électroniques (DME) à la Faculté de Médecine et de Pharmacie de Casablanca.

## Objectifs

- Analyser les données DME en rhumatologie (structurées et non structurées)
- Générer des résumés de dossiers patients
- Identifier des tendances cliniques
- Assurer la sécurité et la confidentialité des données (déploiement local)

---

## Stack technique

| Composant        | Technologie                          |
|------------------|--------------------------------------|
| Backend          | FastAPI (Python)                     |
| Frontend Web     | React 18, React Router, Axios        |
| Frontend Mobile  | React Native                         |
| Base de données  | Mysql                                |
| Auth             | JWT (Bearer), bcrypt                 |
| IA               | Préparé (modèle non chargé en dev)  |

---

## Fonctionnalités

### Authentification
- **Login** (`/`) — Connexion par identifiant + mot de passe → JWT
- **Inscription** (`/signup`) — Création de compte (côté frontend)
- **Profil** (`/profile`) — Consultation / édition du profil, changement de mot de passe

### Dashboard (`/dashboard`)
- Vue d’ensemble : cartes de statistiques, rendez-vous du jour, patients récents

### Patients (`/patients`, `/patients/:id`)
- **Liste** : tableau avec IPP, nom, contact, ville, diagnostic, dernière visite, prochain RDV, statut
- **Recherche / filtre** : par IPP, nom, téléphone, diagnostic, ville + filtre par statut (Tous / Actif / En attente)
- **Ajout** : IPP (optionnel), nom, date de naissance, téléphone, email, ville, **assurance / mutuelle** (liste déroulante : CNSS, CNOPS, RAMED, etc.), diagnostic, notes médicales, notes administratives, optionnellement premier RDV
- **Modification / suppression** d’un patient
- **Fiche patient** : identité, téléphone et email cliquables, adresse/ville, assurance, onglets **Vue d’ensemble** (groupe sanguin, assurance, allergies, contact d’urgence, notes médicales et administratives), **Historique**, **Traitements**, **Rendez-vous**, **Résultats**, **Actes** (liste + bouton « Nouvel acte » → ouverture des actes médicaux avec le patient présélectionné)

### Rendez-vous (`/appointments`)
- Calendrier mensuel + liste des RDV du jour sélectionné
- Vue Liste / Calendrier — Ajout, confirmation, annulation de RDV

### Actes médicaux (`/medical-acts`)
- **Liste** : cartes par acte (patient, type, date, diagnostic, traitement, statut)
- **Recherche** par patient, ID, diagnostic — **Filtre** par type (Consultation, Examen, etc.)
- **Nouvel acte** : patient, date, type, catégorie, **rapport de consultation**, diagnostic, traitement, **médecin(s) / équipe** (sélection multiple), montant, statut
- **Détail** : rapport, traitement, **documents attachés** (liste + « Attacher un document ») — API `GET/POST /api/medical-acts/{id}/documents`
- Depuis la fiche patient : « Nouvel acte » ouvre la page actes avec le patient présélectionné (`?patientId=X&new=1`)

### Assistant IA (`/assistant`)
- Chat avec le backend : envoi de messages + contexte patient optionnel — Réponse type placeholder tant qu’aucun modèle n’est chargé

### Analytics (`/analytics`)
- Graphiques et statistiques d’activité — Backend : `GET /api/analytics/summary` (stub)

### Notifications (`/notifications`)
- Liste des alertes / notifications — Backend : `GET /api/notifications` (stub)

### Admin (si `is_admin`)
- **Dashboard** (`/admin`), **Utilisateurs** (`/admin/users`), **Analytics** (`/admin/analytics`), **Sécurité** (`/admin/security`), **Paramètres** (`/admin/settings`) — Lien Admin dans la sidebar uniquement pour les comptes admin

### Légal
- **CGU** (`/terms`), **Confidentialité** (`/privacy`)

---

## API backend (résumé)

| Préfixe              | Rôle |
|----------------------|------|
| `POST /api/auth/login` | Connexion (JWT) |
| `GET /api/auth/me`     | Utilisateur courant (JWT) |
| `GET|POST /api/patients/`, `GET|PUT|DELETE /api/patients/{id}` | Patients (recherche via `q`, `ipp`, `name`, `phone`, `diagnosis`, `status`) |
| `GET|POST /api/appointments/`, … | Rendez-vous (stub) |
| `GET|POST /api/medical-acts/`, `GET|POST /api/medical-acts/{id}/documents`, … | Actes médicaux et documents (stub) |
| `POST /api/chat`      | Chat IA (réponse placeholder) |
| `GET /api/analytics/summary` | Analytics (stub) |
| `GET /api/notifications` | Notifications (stub) |

---

## À savoir

1. **Données** : En l’état, patients, rendez-vous, actes, notifications et analytics utilisent des **données mock / locale** côté frontend. Les endpoints backend renvoient souvent `[]` ou des stubs. Pour des données réelles, il faut brancher l’API sur la base (modèles SQLAlchemy déjà définis : Patient, Appointment, MedicalAct, ActDocument, User, Notification).

2. **Base de données** : Par défaut **SQLite** (`backend/app/config.py` → `DATABASE_URL`). Les tables ne sont pas créées automatiquement dans `main.py` ; il faut les créer (migrations ou `Base.metadata.create_all(engine)` avec tous les modèles importés).

3. **URL de l’API** : Dans `frontend/web/src/api/api.js`, `API_URL = 'http://localhost:8000/api'`. Le backend tourne sur le port **8000**.

4. **Auth** : Le token JWT est stocké dans **localStorage** (`token`). Les requêtes envoient `Authorization: Bearer <token>`. La connexion utilise des **utilisateurs mock** dans `auth_service.py` ; l’inscription ne crée pas d’utilisateur côté backend.

5. **Admin** : Seuls les comptes avec `is_admin: True` dans les utilisateurs mock voient et utilisent les routes `/admin`.

6. **IA** : Aucun modèle chargé : `llm.generate()` dans `backend/app/models/llm.py` renvoie une chaîne fixe. Pour une vraie IA, il faut charger un modèle (ex. Transformers) et implémenter `generate()`.

---

## Installation et lancement

```bash
# Cloner le projet
git clone https://github.com/Ismailbak/Medical-AI-Assitant.git
cd Medical-AI-Assitant

# Backend (port 8000)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (port 3000)
cd frontend/web
npm install
npm start
```

Ouvrir `http://localhost:3000` et se connecter avec un compte démo.

## Comptes démo

| Identifiant           | Mot de passe   |
|-----------------------|----------------|
| `doctor`              | `password123`  |
| `admin@churochd.ma`   | `adminpass2026`|

*(Les comptes sont définis dans `backend/app/services/auth_service.py`.)*

---

## Structure du projet

```
├── backend/                 # API FastAPI
│   └── app/
│       ├── api/             # auth, patients, appointments, medical_acts, chat, analytics, notifications
│       ├── models/          # Patient, MedicalAct, ActDocument, User, Appointment, Notification, llm
│       ├── services/        # auth_service, chat_service, analytics_service, ...
│       ├── config.py        # DATABASE_URL, SECRET_KEY, ...
│       ├── database.py      # SQLAlchemy engine, session
│       └── main.py          # Point d’entrée FastAPI
├── frontend/
│   ├── web/                 # Application React
│   │   └── src/
│   │       ├── api/api.js   # Appels API (baseURL, intercepteur JWT)
│   │       ├── pages/       # Login, Dashboard, Patients, Appointments, MedicalActs, Assistant, ...
│   │       └── App.js       # Routes
│   └── mobile/              # Application React Native (Dashboard, Login, Patients, Analytics, Notifications)
└── readme.md
```

---

*🔒 Données prévues pour rester en local (conformité RGPD).*
