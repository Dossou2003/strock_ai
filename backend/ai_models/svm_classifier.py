"""
Module pour le classifieur Ensemble de détection d'AVC.

Ce module charge le modèle Ensemble (SVM + XGBoost + AdaBoost) pré-entraîné
et effectue la classification basée sur le vecteur d'asymétrie GLCM/GLRLM.
"""

import numpy as np
import joblib
from django.conf import settings
import os


class StrokeClassifier:
    """
    Classe pour la classification AVC avec modèle Ensemble.
    
    Le modèle ensemble combine les prédictions de 3 classifieurs :
    - SVM (Support Vector Machine)
    - XGBoost
    - AdaBoost
    
    La probabilité finale est la moyenne des 3 modèles.
    """
    
    def __init__(self):
        """Initialise et charge le modèle Ensemble."""
        self.ensemble_model = None
        self.svm = None
        self.xgb = None
        self.ada = None
        self.scaler = None
        self.optimal_threshold = 0.5
        self.selected_features = []
        self._load_models()
    
    def _load_models(self):
        """Charge le modèle Ensemble depuis ensemble_final.pkl."""
        ensemble_path = settings.ENSEMBLE_MODEL_PATH
        
        # Vérifier l'existence du fichier
        if not os.path.exists(ensemble_path):
            raise FileNotFoundError(
                f"Modèle Ensemble introuvable: {ensemble_path}\n"
                f"Veuillez copier ensemble_final.pkl dans {settings.AI_MODELS_DIR}"
            )
        
        try:
            self.ensemble_model = joblib.load(ensemble_path)
            
            # Extraire les composants du modèle ensemble
            self.svm = self.ensemble_model['svm']
            self.xgb = self.ensemble_model['xgb']
            self.ada = self.ensemble_model['ada']
            self.scaler = self.ensemble_model['scaler']
            self.optimal_threshold = self.ensemble_model.get('optimal_threshold', 0.5)
            self.selected_features = self.ensemble_model.get('selected_features', [])
            
            print(f"✅ Modèle Ensemble chargé depuis: {ensemble_path}")
            print(f"   - SVM: {type(self.svm).__name__}")
            print(f"   - XGBoost: {type(self.xgb).__name__}")
            print(f"   - AdaBoost: {type(self.ada).__name__}")
            print(f"   - Seuil optimal: {self.optimal_threshold:.3f}")
            print(f"   - Features sélectionnées: {len(self.selected_features)}")
        except Exception as e:
            raise RuntimeError(f"Erreur lors du chargement du modèle Ensemble: {e}")
    
    def get_selected_features(self):
        """
        Retourne la liste des features sélectionnées pour l'entraînement.
        
        Returns:
            list: Liste des noms de features (ex: ['delta_homogeneity', 'delta_GLNU', ...])
        """
        return self.selected_features
    
    def predict(self, features_vector):
        """
        Prédit si une image contient un AVC basé sur le vecteur d'asymétrie.
        
        Args:
            features_vector: Vecteur d'asymétrie (15 features sélectionnées)
        
        Returns:
            dict: {
                'has_stroke': bool (True si AVC détecté),
                'probability': float (probabilité d'AVC, 0-1),
                'confidence': str (niveau de confiance),
                'details': dict (probabilités par modèle)
            }
        """
        if self.svm is None or self.xgb is None or self.ada is None:
            raise RuntimeError("Modèle Ensemble non chargé")
        
        # Convertir en numpy array si nécessaire
        if not isinstance(features_vector, np.ndarray):
            features_vector = np.array(features_vector)
        
        # Reshape si nécessaire
        if features_vector.ndim == 1:
            features_vector = features_vector.reshape(1, -1)
        
        # Normaliser avec le scaler
        features_scaled = self.scaler.transform(features_vector)
        
        # Prédictions individuelles
        proba_svm = self.svm.predict_proba(features_scaled)[0, 1]
        proba_xgb = self.xgb.predict_proba(features_scaled)[0, 1]
        proba_ada = self.ada.predict_proba(features_scaled)[0, 1]
        
        # Moyenne ensemble
        proba_final = (proba_svm + proba_xgb + proba_ada) / 3
        
        # Décision avec seuil optimisé
        has_stroke = proba_final >= self.optimal_threshold
        
        # Niveau de confiance
        if proba_final >= 0.8 or proba_final <= 0.2:
            confidence = "Élevée"
        elif proba_final >= 0.6 or proba_final <= 0.4:
            confidence = "Modérée"
        else:
            confidence = "Faible"
        
        return {
            'has_stroke': bool(has_stroke),
            'probability': float(proba_final),
            'confidence': confidence,
            'threshold': float(self.optimal_threshold),
            'details': {
                'proba_svm': float(proba_svm),
                'proba_xgb': float(proba_xgb),
                'proba_adaboost': float(proba_ada)
            }
        }
    
    def predict_batch(self, features_matrix):
        """
        Prédit pour plusieurs échantillons.
        
        Args:
            features_matrix: Matrice (N, 15) de vecteurs d'asymétrie
        
        Returns:
            list: Liste de dicts avec prédictions pour chaque échantillon
        """
        if self.svm is None or self.xgb is None or self.ada is None:
            raise RuntimeError("Modèle Ensemble non chargé")
        
        # Normaliser
        features_scaled = self.scaler.transform(features_matrix)
        
        # Prédictions individuelles
        proba_svm = self.svm.predict_proba(features_scaled)[:, 1]
        proba_xgb = self.xgb.predict_proba(features_scaled)[:, 1]
        proba_ada = self.ada.predict_proba(features_scaled)[:, 1]
        
        # Moyenne ensemble
        proba_final = (proba_svm + proba_xgb + proba_ada) / 3
        
        # Construire les résultats
        results = []
        for i in range(len(proba_final)):
            prob = proba_final[i]
            has_stroke = prob >= self.optimal_threshold
            
            if prob >= 0.8 or prob <= 0.2:
                confidence = "Élevée"
            elif prob >= 0.6 or prob <= 0.4:
                confidence = "Modérée"
            else:
                confidence = "Faible"
            
            results.append({
                'has_stroke': bool(has_stroke),
                'probability': float(prob),
                'confidence': confidence,
                'details': {
                    'proba_svm': float(proba_svm[i]),
                    'proba_xgb': float(proba_xgb[i]),
                    'proba_adaboost': float(proba_ada[i])
                }
            })
        
        return results
