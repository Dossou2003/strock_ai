# Guide de Configuration - Stroke Detection AI

## 📋 Prérequis

- Python 3.10+
- Node.js 18+
- PostgreSQL (URL fournie)
- Git

## 🚀 Installation Backend

### 1. Créer l'environnement virtuel

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditer `.env` et remplir :
- `DATABASE_URL` : URL PostgreSQL fournie
- `GEMINI_API_KEY` : Clé API Gemini (gratuite sur https://makersuite.google.com/app/apikey)
- `SECRET_KEY` : Générer avec `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

### 4. Copier les modèles IA

```bash
# Copier le modèle U-Net
cp /home/Armel/Mémoire/unet_territories.h5 models_saved/

# Copier SVM et scaler depuis Colab (après entraînement)
# Télécharger svm_classifier.pkl et scaler.pkl
# Les placer dans models_saved/
```

### 5. Migrations et superuser

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 6. Lancer le serveur

```bash
python manage.py runserver
```

API disponible sur : http://localhost:8000

## 🎨 Installation Frontend

### 1. Installer les dépendances

```bash
cd frontend
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditer `.env` :
```
VITE_API_URL=http://localhost:8000
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Application disponible sur : http://localhost:5173

## ✅ Vérification

### Backend
- [ ] Serveur Django démarre sans erreur
- [ ] Admin accessible sur http://localhost:8000/admin
- [ ] API docs sur http://localhost:8000/api/docs (à venir)

### Frontend
- [ ] Application React démarre
- [ ] Page d'accueil s'affiche
- [ ] Navigation fonctionne

## 🔧 Commandes utiles

### Backend
```bash
# Créer une migration
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Créer un superuser
python manage.py createsuperuser

# Collecter les fichiers statiques
python manage.py collectstatic

# Shell Django
python manage.py shell
```

### Frontend
```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

## 🐛 Dépannage

### Erreur de connexion DB
- Vérifier que `DATABASE_URL` est correct dans `.env`
- Tester la connexion PostgreSQL

### Erreur modèle IA
- Vérifier que les fichiers .h5 et .pkl sont dans `models_saved/`
- Vérifier les permissions de lecture

### Erreur CORS
- Vérifier `CORS_ALLOWED_ORIGINS` dans backend/.env
- Vérifier `VITE_API_URL` dans frontend/.env

## 📚 Prochaines étapes

1. Développer les modèles Django (Phase 2)
2. Créer les endpoints API
3. Intégrer le pipeline IA
4. Développer les composants React
5. Tester et déployer
