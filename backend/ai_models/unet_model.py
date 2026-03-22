"""
Module pour le modèle U-Net de segmentation des territoires vasculaires.

Ce module charge le modèle U-Net pré-entraîné et effectue la segmentation
des territoires vasculaires cérébraux (ACA, ACM_g, ACM_d, ACP).
"""

import numpy as np
import cv2
from tensorflow.keras.models import load_model
from django.conf import settings
import os


class UNetSegmenter:
    """
    Classe pour la segmentation des territoires vasculaires avec U-Net.
    """
    
    def __init__(self):
        """
        Initialise et charge le modèle U-Net.
        
        CONVENTION RADIOLOGIQUE:
        Les classes de segmentation suivent la convention radiologique standard:
        - Classe 0: Fond (background)
        - Classe 1: ACA (Artère Cérébrale Antérieure)
        - Classe 2: ACM_d (Artère Cérébrale Moyenne DROITE du patient, côté GAUCHE de l'image)
        - Classe 3: ACM_g (Artère Cérébrale Moyenne GAUCHE du patient, côté DROIT de l'image)
        - Classe 4: ACP (Artère Cérébrale Postérieure)
        """
        self.model = None
        self.class_labels = {
            0: "background",
            1: "ACA",
            2: "ACM_d",  # Hémisphère droit du patient (côté gauche de l'image)
            3: "ACM_g",  # Hémisphère gauche du patient (côté droit de l'image)
            4: "ACP"
        }
        self._load_model()
    
    def _load_model(self):
        """Charge le modèle U-Net depuis le fichier .h5."""
        model_path = settings.UNET_MODEL_PATH
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Modèle U-Net introuvable: {model_path}\n"
                f"Veuillez copier unet_territories.h5 dans {settings.AI_MODELS_DIR}"
            )
        
        try:
            self.model = load_model(model_path, compile=False)
            print(f"✅ Modèle U-Net chargé depuis: {model_path}")
        except Exception as e:
            raise RuntimeError(f"Erreur lors du chargement du modèle U-Net: {e}")
    
    def preprocess_image(self, image):
        """
        Prétraite l'image pour le modèle U-Net.
        
        Args:
            image: Image numpy array (H, W) ou (H, W, C)
        
        Returns:
            Image prétraitée (1, 256, 256, 1)
        """
        # Convertir en niveaux de gris si nécessaire
        if len(image.shape) == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Redimensionner à 256x256
        img_resized = cv2.resize(image, (256, 256))
        
        # Normaliser [0, 255] -> [0, 1]
        img_normalized = img_resized.astype(np.float32) / 255.0
        
        # Ajouter les dimensions batch et channel
        img_input = img_normalized[None, ..., None]  # (1, 256, 256, 1)
        
        return img_input
    
    def predict(self, image):
        """
        Effectue la segmentation d'une image CT.
        
        Args:
            image: Image numpy array (H, W) ou (H, W, C)
        
        Returns:
            dict: {
                'mask': Masque de segmentation (H, W) avec classes 0-4,
                'probabilities': Probabilités pour chaque classe (H, W, 5),
                'original_shape': Forme originale de l'image
            }
        """
        if self.model is None:
            raise RuntimeError("Modèle U-Net non chargé")
        
        original_shape = image.shape[:2]
        
        # Prétraiter l'image
        img_input = self.preprocess_image(image)
        
        # Prédiction
        pred = self.model.predict(img_input, verbose=0)[0]  # (256, 256, 5)
        
        # Obtenir le masque de segmentation (argmax)
        pred_mask = np.argmax(pred, axis=-1)  # (256, 256)
        
        # Redimensionner au format original
        pred_mask_resized = cv2.resize(
            pred_mask.astype(np.uint8),
            (original_shape[1], original_shape[0]),
            interpolation=cv2.INTER_NEAREST
        )
        
        return {
            'mask': pred_mask_resized,
            'probabilities': pred,
            'original_shape': original_shape
        }
    
    def extract_territory(self, image, mask, territory_id):
        """
        Extrait une région spécifique du territoire vasculaire.
        
        Args:
            image: Image originale (H, W)
            mask: Masque de segmentation (H, W)
            territory_id: ID du territoire (1=ACA, 2=ACM_d, 3=ACM_g, 4=ACP)
        
        Returns:
            dict: {
                'roi': ROI extraite (cropped),
                'mask_roi': Masque de la ROI,
                'bbox': Bounding box (min_x, min_y, max_x, max_y),
                'exists': True si le territoire existe
            }
        """
        # Créer le masque binaire pour ce territoire
        territory_mask = (mask == territory_id).astype(np.uint8)
        
        # Vérifier si le territoire existe
        if np.sum(territory_mask) == 0:
            return {
                'roi': None,
                'mask_roi': None,
                'bbox': None,
                'exists': False
            }
        
        # Trouver la bounding box
        ys, xs = np.where(territory_mask == 1)
        min_x, max_x = np.min(xs), np.max(xs)
        min_y, max_y = np.min(ys), np.max(ys)
        
        # Extraire la ROI
        cropped_mask = territory_mask[min_y:max_y+1, min_x:max_x+1]
        cropped_image = image[min_y:max_y+1, min_x:max_x+1]
        
        # Appliquer le masque
        masked_image = cv2.bitwise_and(cropped_image, cropped_image, mask=cropped_mask)
        
        return {
            'roi': masked_image,
            'mask_roi': cropped_mask,
            'bbox': (min_x, min_y, max_x, max_y),
            'exists': True
        }
