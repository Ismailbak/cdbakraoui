# RhumatoAI 🏥

**Assistant IA pour la Rhumatologie** - CHU Ibn Rochd, Casablanca

> Projet de Fin d'Études | Février – Juillet 2026  
> Superviseur : Prof. Samy Housbane

---

## 📋 Description

Système d'intelligence artificielle local pour assister les rhumatologues dans l'analyse et la synthèse des dossiers médicaux électroniques (DME) à la Faculté de Médecine et de Pharmacie de Casablanca.

## 🎯 Objectifs

- Analyser les données DME en rhumatologie (structurées et non structurées)
- Générer des résumés de dossiers patients
- Identifier des tendances cliniques
- Assurer la sécurité et la confidentialité des données (déploiement local)

## 🚀 Fonctionnalités

| Module | Description |
|--------|-------------|
| Dashboard | Vue d'ensemble de l'activité |
| Patients | Gestion des dossiers patients |
| Rendez-vous | Calendrier et planification |
| Actes médicaux | Suivi des consultations |
| Assistant IA | Chat intelligent pour aide au diagnostic |
| Analytics | Rapports et statistiques |
| Notifications | Alertes personnalisées |

## 🛠️ Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend Web | React 18 |
| Frontend Mobile | React Native |
| Backend | FastAPI (Python) |
| Base de données | PostgreSQL |
| IA/ML | Transformers, LangChain |
| Déploiement | Docker |

## 📦 Installation

```bash
# Cloner le projet
git clone https://github.com/Ismailbak/Medical-AI-Assitant.git
cd Medical-AI-Assitant

# Lancer avec Docker
docker-compose up -d

# Ou manuellement :
# Backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload

# Frontend
cd frontend/web && npm install && npm start
```

## 🔐 Connexion Démo

| Email | Mot de passe |
|-------|--------------|
| demo@churochd.ma | demo123 |

## 📁 Structure

```
├── backend/          # API FastAPI
├── frontend/
│   ├── web/          # Application React
│   └── mobile/       # Application React Native
├── data/             # Données anonymisées
└── docker-compose.yml
```

---

*🔒 Toutes les données restent locales pour conformité RGPD*