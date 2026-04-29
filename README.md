# 🧠 BrainUP — Plateforme E-Learning Intelligente

---

## Description

Ce projet est une plateforme e-learning qui permet aux enseignants de créer des cours et aux étudiants de suivre leur progression.

L'application intègre aussi un chatbot intelligent pour aider les étudiants à mieux comprendre les contenus.

Le but est de proposer une expérience d'apprentissage simple, moderne et interactive.

---

## Fonctionnalités

### Côté Enseignant

- Création et modification de cours
- Ajout de leçons (PDF)
- Création de quiz (questions et réponses)
- Consultation des résultats des étudiants
- Suivi des performances

### Côté Étudiant

- Accès aux cours disponibles
- Lecture des leçons (PDF avec suivi de progression)
- Système de progression automatique
- Participation aux quiz
- Suivi des résultats
- Système de recommandations des cours

### Côté Admin

- Vue sur les informations des utilisateurs
- Gestion des utilisateurs
- Gestion des demandes de réinitialisation de mot de passe
- Gestion des cours

### Chatbot

- Répond aux questions des étudiants et enseignants
- Utilise les contenus des cours
- Interaction simple avec l'utilisateur

---

## Fonctionnement du Chatbot

1. Les fichiers JSON sont analysés
2. Un système **TF-IDF** est utilisé pour trouver les parties les plus proches de la question
3. Une **similarité cosinus** permet de sélectionner les passages pertinents
4. Ces informations sont envoyées à un modèle LLM (**Phi-3 Mini**)
5. Le modèle génère une réponse

> ⚠️ **Remarque :** Le chatbot peut parfois se tromper, surtout si la question est complexe.

---

## Technologies Utilisées

### Frontend

| Technologie | Rôle |
|---|---|
| React.js | Framework principal |
| React Router | Navigation |
| CSS (responsive) | Mise en page |
| React Icons (lucide-react) | Icônes |
| React PDF | Lecture de PDF |

### Backend

| Technologie | Rôle |
|---|---|
| Django | Framework backend |
| Django REST Framework | API REST |
| Authentification JWT | Sécurité |

### Chatbot / IA

| Composant | Détail |
|---|---|
| TF-IDF | Recherche de pertinence |
| Similarité cosinus | Sélection des passages |
| Modèle | Phi-3 Mini (via Ollama) |

---

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/wlahmi2027/BrainUP.git
cd BrainUP
```

### 2. Backend (Django)

```bash
cd backend

# Créer un environnement virtuel
python -m venv .venv

# Activer l'environnement virtuel
source venv/bin/activate   # Linux / Mac
.venv\Scripts\activate      # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8001
```

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

### 4. Chatbot

```bash
# Installer Ollama
# https://ollama.com

# Vérifier l'installation
ollama --version

# Lancer Ollama
ollama serve

# Télécharger le modèle
ollama pull phi3:mini
```

---

## Sécurité

- Authentification par tokens générés aléatoirement
- Accès selon rôle (enseignant / étudiant)
- Routes sécurisées
- Gestion des utilisateurs et cours par des Admin

---

## Responsive

Le site est adapté pour :

- Mobile
- Tablette
- Ordinateur

---

## Structure du Projet

```
frontend/
├── pages/
├── components/
└── styles/

backend/
├── api/
├── models/
└── views/
```

---

## Améliorations Possibles

- Améliorer le chatbot
- Génération de PDF
- Déploiement du projet
- Login par JWT

---

## Auteurs

- Wissam LAHMIDI
- Gwenolé COAT

## Encadrement

M. Bilel ELAYEB

---

## Commentaire

Le projet couvre les fonctionnalités principales d'une plateforme e-learning.
Le chatbot fonctionne mais peut encore être amélioré.
L'ensemble est cohérent et fonctionnel.
