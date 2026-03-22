# 🚀 Guide de Démarrage Rapide

## ⚡ Lancement Rapide (Développement Local)

### Backend (Django)

```bash
cd backend

# 1. Créer .env depuis le template
cp .env.example .env

# 2. Éditer .env et configurer:
# - DATABASE_URL (optionnel, SQLite par défaut)
# - GEMINI_API_KEY (obtenir sur https://makersuite.google.com/app/apikey)

# 3. Activer l'environnement virtuel
source venv/bin/activate

# 4. Installer les dépendances (si pas déjà fait)
pip install -r requirements.txt

# 5. Migrations
python manage.py makemigrations
python manage.py migrate

# 6. Créer un superuser
python manage.py createsuperuser

# 7. Lancer le serveur
python manage.py runserver
```

**Backend disponible sur:** http://localhost:8000  
**Admin Django:** http://localhost:8000/admin

---

### Frontend (React)

```bash
cd frontend

# 1. Créer .env depuis le template
cp .env.example .env

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur dev
npm run dev
```

**Frontend disponible sur:** http://localhost:5173

---

## 📋 Checklist Avant de Commencer

### Modèles IA Requis

Copier ces fichiers dans `backend/models_saved/`:

- [ ] `unet_territories.h5` - Modèle U-Net (depuis ton projet)
- [ ] `svm_classifier.pkl` - Modèle SVM (depuis Colab après entraînement)
- [ ] `scaler.pkl` - StandardScaler (depuis Colab)

**Sans ces fichiers, l'analyse ne fonctionnera pas !**

---

## 🔑 Variables d'Environnement Essentielles

### Backend (.env)

```env
# Django
SECRET_KEY=votre-cle-secrete-ici
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de données (optionnel, SQLite par défaut)
# DATABASE_URL=postgresql://user:password@host:port/database

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Gemini API (OBLIGATOIRE pour le chatbot)
GEMINI_API_KEY=votre-cle-gemini-ici
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

---

## 🧪 Tester l'API

### 1. Inscription

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### 2. Connexion

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "password": "testpass123"
  }'
```

Copier le `access` token de la réponse.

### 3. Upload d'une image

```bash
curl -X POST http://localhost:8000/api/analysis/ \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -F "ct_image=@/chemin/vers/image.jpg"
```

### 4. Vérifier le statut

```bash
curl -X GET http://localhost:8000/api/analysis/ID_ANALYSE/status/ \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 📊 Endpoints API Disponibles

### Authentification
- `POST /api/auth/register/` - Inscription
- `POST /api/auth/login/` - Connexion
- `POST /api/auth/refresh/` - Rafraîchir le token
- `GET /api/auth/me/` - Profil utilisateur

### Analyses
- `GET /api/analysis/` - Liste des analyses
- `POST /api/analysis/` - Upload image
- `GET /api/analysis/{id}/` - Détails
- `GET /api/analysis/{id}/status/` - Statut
- `DELETE /api/analysis/{id}/` - Supprimer

### Résultats
- `GET /api/results/` - Liste des résultats
- `GET /api/results/{id}/` - Détails
- `GET /api/results/analysis/{analysis_id}/` - Résultat par analyse

### Chatbot
- `GET /api/chatbot/` - Historique
- `POST /api/chatbot/` - Envoyer message
- `DELETE /api/chatbot/clear/` - Effacer historique

### Statistiques (Admin/Doctor)
- `GET /api/stats/overview/` - Vue d'ensemble
- `GET /api/stats/performance/` - Performance modèle

---

## 🐛 Dépannage

### Erreur: "Modèle U-Net introuvable"
➡️ Copier `unet_territories.h5` dans `backend/models_saved/`

### Erreur: "Modèle SVM introuvable"
➡️ Copier `svm_classifier.pkl` et `scaler.pkl` dans `backend/models_saved/`

### Erreur: "Clé API Gemini non configurée"
➡️ Ajouter `GEMINI_API_KEY` dans `backend/.env`

### Erreur CORS
➡️ Vérifier que `CORS_ALLOWED_ORIGINS` contient l'URL du frontend

### Port déjà utilisé
```bash
# Backend
python manage.py runserver 8001

# Frontend
npm run dev -- --port 5174
```

---

## 📚 Documentation Complète

- **Plan détaillé:** `PLAN_COMPLET_PROJET.txt`
- **README:** `README.md`
- **Setup complet:** `docs/SETUP.md`

---

## 🎯 Prochaines Étapes

1. ✅ Copier les modèles IA
2. ✅ Configurer les variables d'environnement
3. ✅ Lancer backend et frontend
4. ✅ Tester l'upload d'une image
5. ✅ Vérifier les résultats
6. 🚀 Développer les visualisations 3D
7. 🚀 Améliorer l'interface utilisateur
8. 🚀 Déployer sur Render

---

**Besoin d'aide ?** Consulte le plan complet ou la documentation.
