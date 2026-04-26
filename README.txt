BrainUP - PLATEFORME E-LEARNING INTELLIGENTE
=============================================

/*DESCRIPTION*/

Ce projet est une plateforme e-learning qui permet aux enseignants de créer des cours et aux étudiants de suivre leur progression.

L’application intègre aussi un chatbot intelligent pour aider les étudiants à mieux comprendre les contenus.

Le but est de proposer une expérience d’apprentissage simple, moderne et interactive.

/*FONCTIONNALITÉS*/

-Côté enseignant :

Création et modification de cours
Ajout de leçons (PDF)
Création de quiz (questions et réponses)
Consultation des résultats des étudiants
Suivi des performances

-Côté étudiant :

Accès aux cours disponibles
Lecture des leçons (PDF avec suivi de progression)
Système de progression automatique
Participation aux quiz
Suivi des résultats
Système de Recommandations des cours 

-Chatbot :

Répond aux questions des étudiants et enseigants
Utilise les contenus des cours
Interaction simple avec l’utilisateur


/*FONCTIONNEMENT DU CHATBOT*/

Le chatbot fonctionne de la manière suivante :

Les fichiers JSON sont analysés
Un système TF-IDF est utilisé pour trouver les parties les plus proches de la question
Une similarité cosinus permet de sélectionner les passages pertinents
Ces informations sont envoyées à un modèle LLM (Phi-3 Mini)
Le modèle génère une réponse

Remarque :
Le chatbot peut parfois se tromper, surtout si la question est complexe.

/*TECHNOLOGIES UTILISÉES*/

Frontend :

React.js
React Router
CSS (responsive)
React Icons (lucide-react)
React PDF

Backend :

Django
Django REST Framework
Authentification JWT

/*Chatbot / IA :*/

TF-IDF
Similarité cosinus
Modèle : Phi-3 Mini (via Ollama)

INSTALLATION

Cloner le projet

git clone https://github.com/wlahmi2027/BrainUP.git
cd BrainUP

Backend (Django)

cd backend

Créer un environnement virtuel :
python -m venv .venv

Activer l’environnement virtuel :
source .venv/bin/activate   (Linux / Mac)
.venv\Scripts\activate      (Windows)

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8001

Frontend (React)

cd frontend
npm install
npm run dev

Chatbot

Installer Ollama :
https://ollama.com

Vérifier installation :
ollama --version

Télécharger le modèle :
ollama pull phi3

Lancer Ollama :
ollama serve



SÉCURITÉ

Authentification JWT
Accès selon rôle (enseignant / étudiant)
Routes sécurisées

RESPONSIVE

Le site est adapté :

Mobile
Tablette
Ordinateur

STRUCTURE DU PROJET

frontend/
pages/
components/
styles/

backend/
api/
models/
views/

/*Remarque:*/
Branche principale utilisée :
Le projet est actuellement développé sur la branche "gwen2".

Pour récupérer la bonne version :
git checkout gwen2

/*AMÉLIORATIONS POSSIBLES*/

Améliorer le chatbot
Génération de PDF
Déploiement du projet


/*AUTEURS*/

- Wissam LAHMIDI
- Gwenolé COAT

/*ENCADREMENT*/

M. Bilel ELAYEB

/*COMMENTAIRE*/

Le projet couvre les fonctionnalités principales d’une plateforme e-learning.
Le chatbot fonctionne mais peut encore être amélioré.
L’ensemble est cohérent et fonctionnel.