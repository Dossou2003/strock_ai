# Utiliser une image Python officielle légère
FROM python:3.10-slim

# Éviter les fichiers .pyc et activer le buffering pour les logs
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système pour OpenCV et d'autres bibliothèques
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copier le fichier des dépendances
COPY requirements.txt /app/

# Installer les dépendances Python
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copier le reste du code de l'application
COPY . /app/

# Créer les dossiers nécessaires pour les médias
RUN mkdir -p media/uploads media/results

# Exposer le port de Django
EXPOSE 8000

# Commande par défaut (à adapter selon les besoins, ici on utilise runserver pour le dev)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
