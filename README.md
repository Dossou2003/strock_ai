# 🧠 Stroke Detection AI Platform

Application web complète pour la détection automatique d'AVC (Accident Vasculaire Cérébral) par analyse de scans CT cérébraux utilisant l'intelligence artificielle.

## 🎯 Objectif

Détecter l'effacement des sillons corticaux, signe précoce d'AVC ischémique, en utilisant :
- **Segmentation U-Net** des territoires vasculaires
- **Analyse de texture GLCM** (Gray-Level Co-occurrence Matrix)
- **Comparaison d'asymétrie** hémisphérique gauche/droite
- **Classification SVM** pour diagnostic final

## 🏗️ Architecture

```
Frontend (React + TypeScript)  ←→  Backend (Django REST)  ←→  PostgreSQL
         ↓                                  ↓
    Visualisation 3D              Modèles IA (U-Net, SVM)
    Chatbot Gemini                Analyse GLCM
```

## 📦 Stack Technique

### Backend
- Python 3.10+
- Django 4.2 + Django REST Framework
- TensorFlow/Keras (U-Net)
- scikit-image (GLCM)
- scikit-learn (SVM)
- Google Gemini API (chatbot)
- PostgreSQL

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Three Fiber (3D)
- Framer Motion (animations)
- Recharts (graphiques)

## 🚀 Installation

### Backend

```bash
cd backend

# Créer environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer dépendances
pip install -r requirements.txt

# Configurer variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Copier les modèles IA
cp /home/Armel/Mémoire/unet_territories.h5 models_saved/
# Copier aussi svm_classifier.pkl et scaler.pkl depuis Colab

# Migrations
python manage.py migrate

# Créer superuser
python manage.py createsuperuser

# Lancer serveur
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Installer dépendances
npm install

# Configurer variables d'environnement
cp .env.example .env
# Éditer .env avec l'URL du backend

# Lancer serveur dev
npm run dev
```

## 📁 Structure du Projet

```
stroke-detection-app/
├── backend/              # Django REST API
│   ├── config/          # Configuration Django
│   ├── api/             # Endpoints API
│   ├── ai_models/       # Pipeline IA
│   ├── chatbot/         # Gemini chatbot
│   ├── models_saved/    # Modèles pré-entraînés
│   └── media/           # Fichiers uploadés
│
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── pages/       # Pages
│   │   ├── services/    # API clients
│   │   └── store/       # State management
│   └── public/
│
├── docs/                # Documentation
└── PLAN_COMPLET_PROJET.txt  # Plan détaillé
```

## 🔑 Variables d'Environnement

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:pass@host:port/db
GEMINI_API_KEY=your-gemini-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 📊 Fonctionnalités

- ✅ Upload de scans CT (PNG, JPG, DICOM)
- ✅ Segmentation automatique des territoires vasculaires
- ✅ Analyse de texture GLCM avec asymétrie hémisphérique
- ✅ Classification SVM (AVC oui/non + probabilité)
- ✅ Visualisation 3D interactive du cerveau
- ✅ Comparaison gauche/droite avec slider
- ✅ Heatmap d'asymétrie
- ✅ Chatbot médical (Gemini AI)
- ✅ Export PDF professionnel
- ✅ Historique des analyses
- ✅ Espace professionnel (médecins)
- ✅ Ressources éducatives sur l'AVC

## 🧪 Tests

```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm run test
```

## 🚢 Déploiement

### Backend (Render)
1. Créer un compte sur [Render](https://render.com)
2. Connecter le repo GitHub
3. Créer un Web Service
4. Configurer les variables d'environnement
5. Déployer

### Frontend (Render)
1. Créer un Static Site sur Render
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configurer `VITE_API_URL`
5. Déployer

## 📖 Documentation

- [Plan complet du projet](PLAN_COMPLET_PROJET.txt)
- [Documentation API](docs/API.md) *(à venir)*
- [Guide de déploiement](docs/DEPLOYMENT.md) *(à venir)*
- [Guide utilisateur](docs/USER_GUIDE.md) *(à venir)*

## 👨‍💻 Développeur

**Armel DAHOUI**  
Projet de mémoire - Détection d'AVC par IA  
Décembre 2025

## 📄 Licence

Ce projet est développé dans le cadre d'un mémoire académique.

## 🙏 Remerciements

- Dataset: Real_hypodensity-5
- Inspiration: Travaux de Johannes sur l'hypodensité
- Technologies: TensorFlow, Django, React, Gemini AI
