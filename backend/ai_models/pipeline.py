"""
Pipeline complet d'analyse d'images CT pour la détection d'AVC.

Ce module orchestre l'ensemble du processus:
1. Segmentation U-Net des territoires vasculaires
2. Extraction des ROI ACM gauche et droite avec mirroring
3. Analyse de texture GLCM + GLRLM (20 features)
4. Calcul du vecteur d'asymétrie
5. Classification Ensemble (SVM + XGBoost + AdaBoost)
6. Génération des visualisations
"""

import numpy as np
import cv2
import time
from pathlib import Path

from .unet_model import UNetSegmenter
from .glcm_analysis import analyser_asymetrie_acm, asymetrie_vers_vecteur
from .svm_classifier import StrokeClassifier


def analyze_ct_scan(image_path):
    """
    Pipeline complet d'analyse d'un scan CT cérébral.
    
    Étapes:
    1. Charger l'image
    2. Segmentation U-Net
    3. Extraction ROI avec mirroring et analyse radiomique
    4. Classification Ensemble
    5. Détermination du territoire affecté
    
    Args:
        image_path: Chemin vers l'image CT (str ou Path)
    
    Returns:
        dict: {
            'has_stroke': bool,
            'probability': float,
            'confidence': str,
            'affected_territory': str,
            'radiomics_features': dict,
            'processing_time': float,
            'segmentation_mask': np.array,
            'asymmetry_vector': list,
            'details': dict (probabilités par modèle)
        }
    
    Raises:
        FileNotFoundError: Si l'image n'existe pas
        ValueError: Si l'analyse échoue (ROI manquantes, etc.)
    """
    start_time = time.time()
    
    # 1. Charger l'image
    image_path = Path(image_path)
    if not image_path.exists():
        raise FileNotFoundError(f"Image introuvable: {image_path}")
    
    ct_image = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
    if ct_image is None:
        raise ValueError(f"Impossible de charger l'image: {image_path}")
    
    print(f"📸 Image chargée: {ct_image.shape}")
    
    # 2. Segmentation U-Net
    print("🔬 Segmentation U-Net en cours...")
    segmenter = UNetSegmenter()
    segmentation_result = segmenter.predict(ct_image)
    pred_mask = segmentation_result['mask']
    
    print(f"✅ Segmentation terminée. Classes détectées: {np.unique(pred_mask)}")
    
    # 3. Analyse radiomique (GLCM + GLRLM) et asymétrie
    print("📊 Analyse radiomique et asymétrie...")
    asymmetry_result = analyser_asymetrie_acm(ct_image, pred_mask)
    
    if asymmetry_result is None:
        raise ValueError(
            "Impossible d'extraire les ROI ACM gauche et droite. "
            "Vérifiez que l'image contient les deux territoires."
        )
    
    asymetrie = asymmetry_result['asymetrie']
    features_gauche = asymmetry_result['features_gauche']
    features_droite = asymmetry_result['features_droite']
    
    print(f"✅ Features radiomiques calculées (20 features)")
    
    # 4. Classification Ensemble
    print("🤖 Classification Ensemble (SVM + XGBoost + AdaBoost)...")
    classifier = StrokeClassifier()
    
    # Récupérer les features sélectionnées du modèle
    selected_features = classifier.get_selected_features()
    
    # Convertir l'asymétrie en vecteur selon les features sélectionnées
    asymmetry_vector = asymetrie_vers_vecteur(asymetrie, selected_features)
    
    # Prédiction
    classification_result = classifier.predict(asymmetry_vector)
    
    has_stroke = classification_result['has_stroke']
    probability = classification_result['probability']
    confidence = classification_result['confidence']
    details = classification_result.get('details', {})
    
    print(f"✅ Classification terminée")
    print(f"   AVC détecté: {has_stroke}")
    print(f"   Probabilité: {probability:.2%}")
    print(f"   Confiance: {confidence}")
    
    # 5. Déterminer le territoire affecté
    affected_territory = determine_affected_territory(
        asymetrie,
        features_gauche,
        features_droite,
        has_stroke
    )
    
    print(f"   Territoire affecté: {affected_territory}")
    
    # Temps de traitement
    processing_time = time.time() - start_time
    print(f"⏱️  Temps de traitement: {processing_time:.2f}s")
    
    # Construire le résultat final
    result = {
        'has_stroke': has_stroke,
        'probability': probability,
        'confidence': confidence,
        'affected_territory': affected_territory,
        'radiomics_features': {
            'gauche': features_gauche,
            'droite': features_droite,
            'asymetrie': asymetrie
        },
        'processing_time': processing_time,
        'segmentation_mask': pred_mask,
        'asymmetry_vector': asymmetry_vector.tolist(),
        'details': details
    }
    
    return result


def determine_affected_territory(asymetrie, features_gauche, features_droite, has_stroke):
    """
    Détermine quel territoire est affecté par l'AVC.
    
    CONVENTION RADIOLOGIQUE:
    - ACM_g = Artère Cérébrale Moyenne GAUCHE du patient (côté DROIT de l'image CT)
    - ACM_d = Artère Cérébrale Moyenne DROITE du patient (côté GAUCHE de l'image CT)
    
    Logique:
    - Si pas d'AVC: retourne 'none'
    - Si AVC: compare les features pour déterminer le côté le plus affecté
      (côté avec les valeurs les plus anormales)
    
    En cas d'AVC ischémique, on observe typiquement:
    - Diminution de l'entropie (perte de texture/complexité)
    - Diminution du contraste (homogénéisation des intensités)
    - Augmentation de l'homogénéité (uniformité accrue)
    
    Args:
        asymetrie: Dict du vecteur d'asymétrie
        features_gauche: Features GLCM de l'hémisphère gauche (ACM_g, classe 3)
        features_droite: Features GLCM de l'hémisphère droit (ACM_d, classe 2)
        has_stroke: Bool indiquant si AVC détecté
    
    Returns:
        str: 'none', 'ACM_g' (hémisphère gauche affecté), ou 'ACM_d' (hémisphère droit affecté)
    """
    if not has_stroke:
        return 'none'
    
    # Calculer un score d'anomalie pour chaque côté
    # Score élevé = plus d'anomalies = plus probablement affecté
    score_gauche = (
        -features_gauche['entropy'] +
        -features_gauche['contrast'] +
        features_gauche['homogeneity']
    )
    
    score_droite = (
        -features_droite['entropy'] +
        -features_droite['contrast'] +
        features_droite['homogeneity']
    )
    
    # Le côté avec le score le plus élevé est le plus affecté
    if score_gauche > score_droite:
        return 'ACM_g'  # Hémisphère gauche du patient affecté
    else:
        return 'ACM_d'  # Hémisphère droit du patient affecté


def generate_segmentation_image(ct_image, mask, affected_territory='none'):
    """
    Génère une image de segmentation colorée superposée sur le CT.
    
    Args:
        ct_image: Image CT originale (grayscale)
        mask: Masque de segmentation U-Net
        affected_territory: Territoire affecté ('ACM_g', 'ACM_d', etc.)
    
    Returns:
        np.array: Image RGB avec segmentation colorée
    """
    # Convertir en RGB
    if len(ct_image.shape) == 2:
        ct_rgb = cv2.cvtColor(ct_image, cv2.COLOR_GRAY2RGB)
    else:
        ct_rgb = ct_image.copy()
    
    # Couleurs pour chaque classe (BGR)
    # 0: fond, 1: ACA, 2: ACM_d, 3: ACM_g, 4: ACP
    colors = {
        1: (0, 255, 0),       # Vert (ACA - Artère Cérébrale Antérieure)
        2: (255, 165, 0),     # Orange (ACM_d - côté gauche de l'image)
        3: (0, 191, 255),     # Bleu ciel (ACM_g - côté droit de l'image)
        4: (0, 0, 139),       # Rouge foncé (ACP - Artère Cérébrale Postérieure)
    }
    
    # Créer overlay
    overlay = ct_rgb.copy()
    
    for class_id, color in colors.items():
        class_mask = (mask == class_id)
        if np.any(class_mask):
            # Appliquer couleur avec transparence
            overlay[class_mask] = color
    
    # Mélanger avec l'original (alpha blending)
    alpha = 0.4
    result = cv2.addWeighted(ct_rgb, 1 - alpha, overlay, alpha, 0)
    
    # Marquer le territoire affecté avec un contour rouge
    if affected_territory != 'none':
        territory_map = {'ACA': 1, 'ACM_d': 2, 'ACM_g': 3, 'ACP': 4}
        if affected_territory in territory_map:
            affected_mask = (mask == territory_map[affected_territory]).astype(np.uint8)
            contours, _ = cv2.findContours(affected_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cv2.drawContours(result, contours, -1, (0, 0, 255), 3)
    
    return result


def generate_mask_image(mask):
    """
    Génère une image du masque de segmentation pur avec couleurs par classe.
    
    Args:
        mask: Masque de segmentation U-Net (valeurs 0-4)
    
    Returns:
        np.array: Image RGB du masque coloré
    """
    # Créer image RGB vide (fond bleu foncé)
    h, w = mask.shape
    mask_rgb = np.zeros((h, w, 3), dtype=np.uint8)
    mask_rgb[:, :] = (139, 0, 0)  # Fond bleu foncé (BGR)
    
    # Couleurs pour chaque classe (BGR) - mêmes que segmentation
    colors = {
        1: (0, 255, 0),       # Vert (ACA)
        2: (255, 165, 0),     # Orange (ACM_d)
        3: (0, 191, 255),     # Bleu ciel (ACM_g)
        4: (0, 0, 139),       # Rouge foncé (ACP)
    }
    
    # Appliquer couleurs
    for class_id, color in colors.items():
        class_mask = (mask == class_id)
        if np.any(class_mask):
            mask_rgb[class_mask] = color
    
    return mask_rgb


def generate_heatmap_image(ct_image, mask, features_gauche, features_droite):
    """
    Génère une heatmap montrant l'asymétrie entre les hémisphères.
    
    Args:
        ct_image: Image CT originale
        mask: Masque de segmentation
        features_gauche: Features GLCM côté gauche
        features_droite: Features GLCM côté droit
    
    Returns:
        np.array: Image RGB avec heatmap d'asymétrie
    """
    # Convertir en RGB
    if len(ct_image.shape) == 2:
        ct_rgb = cv2.cvtColor(ct_image, cv2.COLOR_GRAY2RGB)
    else:
        ct_rgb = ct_image.copy()
    
    # Calculer un score d'anomalie pour chaque côté
    score_gauche = abs(
        -features_gauche.get('entropy', 0) +
        -features_gauche.get('contrast', 0) +
        features_gauche.get('homogeneity', 0)
    )
    
    score_droite = abs(
        -features_droite.get('entropy', 0) +
        -features_droite.get('contrast', 0) +
        features_droite.get('homogeneity', 0)
    )
    
    # Normaliser les scores
    max_score = max(score_gauche, score_droite, 0.001)
    intensity_gauche = int((score_gauche / max_score) * 255)
    intensity_droite = int((score_droite / max_score) * 255)
    
    # Créer heatmap
    heatmap = np.zeros_like(ct_rgb)
    
    # ACM gauche (classe 1)
    mask_gauche = (mask == 1)
    if np.any(mask_gauche):
        heatmap[mask_gauche] = (0, 0, intensity_gauche)  # Rouge
    
    # ACM droite (classe 2)
    mask_droite = (mask == 2)
    if np.any(mask_droite):
        heatmap[mask_droite] = (0, 0, intensity_droite)  # Rouge
    
    # Appliquer colormap jet pour un meilleur rendu
    heatmap_gray = cv2.cvtColor(heatmap, cv2.COLOR_RGB2GRAY)
    heatmap_colored = cv2.applyColorMap(heatmap_gray, cv2.COLORMAP_JET)
    
    # Mélanger avec l'original
    alpha = 0.5
    result = cv2.addWeighted(ct_rgb, 1 - alpha, heatmap_colored, alpha, 0)
    
    return result


def generate_comparison_image(ct_image, mask, affected_territory='none'):
    """
    Génère une image de comparaison hémisphérique côte à côte.
    
    Args:
        ct_image: Image CT originale
        mask: Masque de segmentation
        affected_territory: Territoire affecté
    
    Returns:
        np.array: Image RGB avec comparaison gauche/droite
    """
    h, w = ct_image.shape[:2]
    mid = w // 2
    
    # Convertir en RGB
    if len(ct_image.shape) == 2:
        ct_rgb = cv2.cvtColor(ct_image, cv2.COLOR_GRAY2RGB)
    else:
        ct_rgb = ct_image.copy()
    
    # Créer image de comparaison (2x largeur)
    comparison = np.zeros((h, w * 2 + 20, 3), dtype=np.uint8)
    
    # Côté gauche de l'image (hémisphère droit du patient - convention radiologique)
    left_half = ct_rgb[:, :mid].copy()
    # Côté droit de l'image (hémisphère gauche du patient)
    right_half = ct_rgb[:, mid:].copy()
    
    # Marquer le côté affecté
    if affected_territory == 'ACM_g':
        # ACM gauche = côté droit de l'image
        cv2.rectangle(right_half, (0, 0), (right_half.shape[1]-1, right_half.shape[0]-1), (0, 0, 255), 3)
        cv2.putText(right_half, "AFFECTE", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    elif affected_territory == 'ACM_d':
        # ACM droite = côté gauche de l'image
        cv2.rectangle(left_half, (0, 0), (left_half.shape[1]-1, left_half.shape[0]-1), (0, 0, 255), 3)
        cv2.putText(left_half, "AFFECTE", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    
    # Assembler
    comparison[:, :mid] = left_half
    comparison[:, mid:mid+20] = 128  # Séparateur gris
    comparison[:, mid+20:mid+20+right_half.shape[1]] = right_half
    
    # Ajouter labels
    cv2.putText(comparison, "Hem. Droit (patient)", (10, h - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    cv2.putText(comparison, "Hem. Gauche (patient)", (mid + 30, h - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    
    return comparison


def analyze_ct_scan_with_visualization(image_path, output_dir=None):
    """
    Pipeline complet avec génération de visualisations.
    
    Args:
        image_path: Chemin vers l'image CT
        output_dir: Dossier de sortie pour les visualisations (optionnel)
    
    Returns:
        dict: Résultat de l'analyse + chemins des images générées
    """
    start_time = time.time()
    
    # 1. Charger l'image
    image_path = Path(image_path)
    if not image_path.exists():
        raise FileNotFoundError(f"Image introuvable: {image_path}")
    
    ct_image = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
    if ct_image is None:
        raise ValueError(f"Impossible de charger l'image: {image_path}")
    
    print(f"📸 Image chargée: {ct_image.shape}")
    
    # 2. Segmentation U-Net
    print("🔬 Segmentation U-Net en cours...")
    segmenter = UNetSegmenter()
    segmentation_result = segmenter.predict(ct_image)
    pred_mask = segmentation_result['mask']
    
    print(f"✅ Segmentation terminée. Classes détectées: {np.unique(pred_mask)}")
    
    # 3. Analyse radiomique (GLCM + GLRLM) et asymétrie
    print("📊 Analyse radiomique et asymétrie...")
    asymmetry_result = analyser_asymetrie_acm(ct_image, pred_mask)
    
    if asymmetry_result is None:
        raise ValueError(
            "Impossible d'extraire les ROI ACM gauche et droite. "
            "Vérifiez que l'image contient les deux territoires."
        )
    
    asymetrie = asymmetry_result['asymetrie']
    features_gauche = asymmetry_result['features_gauche']
    features_droite = asymmetry_result['features_droite']
    
    print(f"✅ Features radiomiques calculées (20 features)")
    
    # 4. Classification Ensemble
    print("🤖 Classification Ensemble (SVM + XGBoost + AdaBoost)...")
    classifier = StrokeClassifier()
    
    selected_features = classifier.get_selected_features()
    asymmetry_vector = asymetrie_vers_vecteur(asymetrie, selected_features)
    classification_result = classifier.predict(asymmetry_vector)
    
    has_stroke = classification_result['has_stroke']
    probability = classification_result['probability']
    confidence = classification_result['confidence']
    details = classification_result.get('details', {})
    
    print(f"✅ Classification terminée")
    print(f"   AVC détecté: {has_stroke}")
    print(f"   Probabilité: {probability:.2%}")
    print(f"   Confiance: {confidence}")
    
    # 5. Déterminer le territoire affecté
    affected_territory = determine_affected_territory(
        asymetrie, features_gauche, features_droite, has_stroke
    )
    
    print(f"   Territoire affecté: {affected_territory}")
    
    # 6. Générer les visualisations
    print("🎨 Génération des visualisations...")
    
    segmentation_img = generate_segmentation_image(ct_image, pred_mask, affected_territory)
    mask_img = generate_mask_image(pred_mask)
    comparison_img = generate_comparison_image(ct_image, pred_mask, affected_territory)
    
    print("✅ Visualisations générées")
    
    # Temps de traitement
    processing_time = time.time() - start_time
    print(f"⏱️  Temps de traitement: {processing_time:.2f}s")
    
    # Construire le résultat final
    result = {
        'has_stroke': has_stroke,
        'probability': probability,
        'confidence': confidence,
        'affected_territory': affected_territory,
        'radiomics_features': {
            'gauche': features_gauche,
            'droite': features_droite,
            'asymetrie': asymetrie
        },
        'processing_time': processing_time,
        'segmentation_mask': pred_mask,
        'asymmetry_vector': asymmetry_vector.tolist(),
        'details': details,
        'visualizations': {
            'segmentation': segmentation_img,
            'mask': mask_img,
            'comparison': comparison_img,
        }
    }
    
    # Sauvegarder les visualisations si output_dir fourni
    if output_dir:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        seg_path = output_dir / 'segmentation.png'
        mask_path = output_dir / 'mask.png'
        comparison_path = output_dir / 'comparison.png'
        
        cv2.imwrite(str(seg_path), segmentation_img)
        cv2.imwrite(str(mask_path), mask_img)
        cv2.imwrite(str(comparison_path), comparison_img)
        
        result['segmentation_image_path'] = str(seg_path)
        result['mask_image_path'] = str(mask_path)
        result['comparison_image_path'] = str(comparison_path)
        
        print(f"💾 Visualisations sauvegardées dans: {output_dir}")
    
    return result
