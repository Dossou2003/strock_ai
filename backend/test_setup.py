#!/usr/bin/env python
"""
Script de test pour vérifier la configuration du backend.

Ce script vérifie:
- Les variables d'environnement
- La connexion à la base de données
- La présence des modèles IA
- Les imports des modules
"""

import os
import sys
from pathlib import Path

# Ajouter le répertoire backend au path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.conf import settings
from django.db import connection
from django.core.management import call_command


def test_environment_variables():
    """Teste les variables d'environnement."""
    print("\n" + "="*60)
    print("TEST 1: Variables d'environnement")
    print("="*60)
    
    checks = {
        'SECRET_KEY': settings.SECRET_KEY,
        'DEBUG': settings.DEBUG,
        'DATABASE_URL': os.getenv('DATABASE_URL', 'SQLite (défaut)'),
        'GEMINI_API_KEY': '✓' if settings.GEMINI_API_KEY else '✗ MANQUANT',
    }
    
    for key, value in checks.items():
        status = "✓" if value else "✗"
        print(f"{status} {key}: {value if key != 'SECRET_KEY' else '***'}")
    
    return bool(settings.GEMINI_API_KEY)


def test_database_connection():
    """Teste la connexion à la base de données."""
    print("\n" + "="*60)
    print("TEST 2: Connexion base de données")
    print("="*60)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✓ Connexion DB réussie")
        print(f"  Engine: {settings.DATABASES['default']['ENGINE']}")
        return True
    except Exception as e:
        print(f"✗ Erreur de connexion DB: {e}")
        return False


def test_ai_models():
    """Teste la présence des modèles IA."""
    print("\n" + "="*60)
    print("TEST 3: Modèles IA")
    print("="*60)
    
    models = {
        'U-Net': settings.UNET_MODEL_PATH,
        'SVM': settings.SVM_MODEL_PATH,
        'Scaler': settings.SCALER_PATH,
    }
    
    all_present = True
    for name, path in models.items():
        exists = path.exists()
        status = "✓" if exists else "✗"
        print(f"{status} {name}: {path}")
        if not exists:
            all_present = False
    
    return all_present


def test_imports():
    """Teste les imports des modules."""
    print("\n" + "="*60)
    print("TEST 4: Imports des modules")
    print("="*60)
    
    modules = [
        ('Django REST Framework', 'rest_framework'),
        ('JWT', 'rest_framework_simplejwt'),
        ('CORS', 'corsheaders'),
        ('TensorFlow', 'tensorflow'),
        ('scikit-image', 'skimage'),
        ('scikit-learn', 'sklearn'),
        ('Gemini', 'google.generativeai'),
        ('Pillow', 'PIL'),
        ('OpenCV', 'cv2'),
    ]
    
    all_imported = True
    for name, module in modules:
        try:
            __import__(module)
            print(f"✓ {name}")
        except ImportError as e:
            print(f"✗ {name}: {e}")
            all_imported = False
    
    return all_imported


def test_models_loading():
    """Teste le chargement des modèles IA."""
    print("\n" + "="*60)
    print("TEST 5: Chargement des modèles IA")
    print("="*60)
    
    results = {}
    
    # Test U-Net
    try:
        from ai_models.unet_model import UNetSegmenter
        segmenter = UNetSegmenter()
        print("✓ U-Net chargé avec succès")
        results['unet'] = True
    except Exception as e:
        print(f"✗ Erreur U-Net: {e}")
        results['unet'] = False
    
    # Test SVM
    try:
        from ai_models.svm_classifier import StrokeClassifier
        classifier = StrokeClassifier()
        print("✓ SVM chargé avec succès")
        results['svm'] = True
    except Exception as e:
        print(f"✗ Erreur SVM: {e}")
        results['svm'] = False
    
    # Test Gemini
    try:
        from chatbot.gemini_client import GeminiChatbot
        chatbot = GeminiChatbot()
        print("✓ Gemini initialisé avec succès")
        results['gemini'] = True
    except Exception as e:
        print(f"✗ Erreur Gemini: {e}")
        results['gemini'] = False
    
    return all(results.values())


def test_migrations():
    """Teste l'état des migrations."""
    print("\n" + "="*60)
    print("TEST 6: Migrations")
    print("="*60)
    
    try:
        from django.db.migrations.executor import MigrationExecutor
        executor = MigrationExecutor(connection)
        plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
        
        if plan:
            print(f"⚠️  {len(plan)} migration(s) en attente")
            print("   Exécuter: python manage.py migrate")
            return False
        else:
            print("✓ Toutes les migrations sont appliquées")
            return True
    except Exception as e:
        print(f"✗ Erreur migrations: {e}")
        return False


def main():
    """Exécute tous les tests."""
    print("\n" + "="*60)
    print("🧪 TEST DE CONFIGURATION DU BACKEND")
    print("="*60)
    
    results = {
        'Variables d\'environnement': test_environment_variables(),
        'Connexion DB': test_database_connection(),
        'Modèles IA présents': test_ai_models(),
        'Imports': test_imports(),
        'Chargement modèles': test_models_loading(),
        'Migrations': test_migrations(),
    }
    
    # Résumé
    print("\n" + "="*60)
    print("RÉSUMÉ")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status} - {test_name}")
    
    total = len(results)
    passed = sum(results.values())
    
    print("\n" + "="*60)
    print(f"RÉSULTAT: {passed}/{total} tests réussis")
    print("="*60)
    
    if passed == total:
        print("\n🎉 Tous les tests sont passés ! Le backend est prêt.")
        return 0
    else:
        print("\n⚠️  Certains tests ont échoué. Vérifiez la configuration.")
        return 1


if __name__ == '__main__':
    sys.exit(main())
