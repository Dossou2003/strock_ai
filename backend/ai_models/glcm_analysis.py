"""
Module pour l'analyse de texture GLCM et GLRLM.

Ce module calcule les features de texture (8 GLCM + 11 GLRLM) et le vecteur 
d'asymétrie hémisphérique pour la détection d'effacement des sillons corticaux.

Basé sur l'article: "A quantitative symmetry-based analysis of hyperacute 
ischemic stroke lesions in noncontrast computed tomography" (PMC5339891)
"""

import numpy as np
import cv2
from skimage.feature import graycomatrix, graycoprops


def apply_fws_filter(roi, kernel_size=5):
    """
    Applique un filtre gaussien FWS (Filter Width Sigma) = 5 voxels.
    
    Args:
        roi: Image ROI numpy array
        kernel_size: Taille du noyau gaussien (défaut: 5)
    
    Returns:
        Image filtrée
    """
    return cv2.GaussianBlur(roi, (kernel_size, kernel_size), 0)


def quantify_roi(roi):
    """
    Normalise et quantifie une ROI à 32 niveaux de gris.
    
    Pour images en niveaux de gris (0-255), pas en HU.
    
    Args:
        roi: Image ROI numpy array
    
    Returns:
        Image quantifiée à 32 niveaux (0-31)
    """
    roi_norm = cv2.normalize(roi, None, 0, 255, cv2.NORM_MINMAX).astype(np.float32)
    roi_quant = (roi_norm / 8).astype(np.uint8)
    return roi_quant


def compute_glcm_8_features(roi_quant):
    """
    Calcule les 8 features Haralick GLCM moyennées sur 4 directions.
    
    Features:
    - contrast, energy, homogeneity, correlation
    - entropy, inertia, cluster_shade, cluster_prominence, inverse_diff_moment
    
    Args:
        roi_quant: Image quantifiée à 32 niveaux
    
    Returns:
        dict: 9 features GLCM
    """
    angles = [0, np.pi/4, np.pi/2, 3*np.pi/4]
    glcm = graycomatrix(roi_quant, distances=[1], angles=angles, 
                        levels=32, symmetric=True, normed=True)
    
    contrast = graycoprops(glcm, 'contrast').mean()
    energy = graycoprops(glcm, 'energy').mean()
    homogeneity = graycoprops(glcm, 'homogeneity').mean()
    correlation = graycoprops(glcm, 'correlation').mean()
    
    glcm_mean = glcm.mean(axis=(2, 3)) + 1e-10
    entropy = -np.sum(glcm_mean * np.log2(glcm_mean))
    
    i, j = np.indices(glcm_mean.shape)
    inertia = np.sum(glcm_mean * (i - j)**2)
    mu = np.sum(glcm_mean * i)
    cluster_shade = np.sum(glcm_mean * (i + j - 2*mu)**3)
    cluster_prominence = np.sum(glcm_mean * (i + j - 2*mu)**4)
    inverse_diff_moment = np.sum(glcm_mean / (1 + (i - j)**2))
    
    return {
        'contrast': float(contrast),
        'energy': float(energy),
        'homogeneity': float(homogeneity),
        'correlation': float(correlation),
        'entropy': float(entropy),
        'inertia': float(inertia),
        'cluster_shade': float(cluster_shade),
        'cluster_prominence': float(cluster_prominence),
        'inverse_diff_moment': float(inverse_diff_moment)
    }


def compute_glrlm_11_features(roi_quant):
    """
    Calcule les 11 features GLRLM moyennées sur 4 directions.
    
    Features:
    - SRE, LRE, GLNU, RLNU, RP
    - LGRE, HGRE, SRLGE, SRHGE, LRLGE, LRHGE
    
    Args:
        roi_quant: Image quantifiée à 32 niveaux
    
    Returns:
        dict: 11 features GLRLM
    """
    directions = [0, 45, 90, 135]
    all_feats = []
    
    for angle in directions:
        if angle == 0:
            img = roi_quant
        elif angle == 45:
            img = np.rot90(roi_quant)
        elif angle == 90:
            img = np.rot90(roi_quant, 2)
        elif angle == 135:
            img = np.rot90(roi_quant, 3)
        
        h, w = img.shape
        max_run = max(h, w)
        rlm = np.zeros((32, max_run + 1))
        
        for y in range(h):
            x = 0
            while x < w:
                val = img[y, x]
                if val == 0:
                    x += 1
                    continue
                length = 1
                while x + length < w and img[y, x + length] == val:
                    length += 1
                if val > 0:
                    rlm[val-1, length] += 1
                x += length
        
        total = np.sum(rlm)
        if total == 0:
            zero_feats = {k: 0.0 for k in ['SRE', 'LRE', 'GLNU', 'RLNU', 'RP', 
                                            'LGRE', 'HGRE', 'SRLGE', 'SRHGE', 
                                            'LRLGE', 'LRHGE']}
            all_feats.append(zero_feats)
            continue
        
        p = rlm / total
        i, j = np.indices(p.shape)
        i += 1
        j += 1
        nr = total
        
        feats = {
            'SRE': float(np.sum(p / j**2) / nr) if nr > 0 else 0.0,
            'LRE': float(np.sum(p * j**2) / nr) if nr > 0 else 0.0,
            'GLNU': float(np.sum(np.sum(p, axis=1)**2) / nr) if nr > 0 else 0.0,
            'RLNU': float(np.sum(np.sum(p, axis=0)**2) / nr) if nr > 0 else 0.0,
            'RP': float(nr / np.sum(p * j)) if np.sum(p * j) > 0 else 0.0,
            'LGRE': float(np.sum(p / i**2) / nr) if nr > 0 else 0.0,
            'HGRE': float(np.sum(p * i**2) / nr) if nr > 0 else 0.0,
            'SRLGE': float(np.sum(p / (i**2 * j**2)) / nr) if nr > 0 else 0.0,
            'SRHGE': float(np.sum(p * i**2 / j**2) / nr) if nr > 0 else 0.0,
            'LRLGE': float(np.sum(p * j**2 / i**2) / nr) if nr > 0 else 0.0,
            'LRHGE': float(np.sum(p * i**2 * j**2) / nr) if nr > 0 else 0.0,
        }
        all_feats.append(feats)
    
    if not all_feats:
        return {k: 0.0 for k in ['SRE', 'LRE', 'GLNU', 'RLNU', 'RP', 
                                  'LGRE', 'HGRE', 'SRLGE', 'SRHGE', 
                                  'LRLGE', 'LRHGE']}
    
    mean_feats = {k: float(np.mean([f[k] for f in all_feats])) for k in all_feats[0]}
    return mean_feats


def compute_all_radiomics_features(roi):
    """
    Pipeline complet: FWS + quantification + GLCM 8 + GLRLM 11.
    
    Args:
        roi: Image ROI numpy array
    
    Returns:
        dict: 20 features radiomiques (9 GLCM + 11 GLRLM)
    """
    roi_filtered = apply_fws_filter(roi)
    roi_quant = quantify_roi(roi_filtered)
    glcm = compute_glcm_8_features(roi_quant)
    glrlm = compute_glrlm_11_features(roi_quant)
    return {**glcm, **glrlm}


def extraire_roi_acm_miroir(ct_img, pred_mask):
    """
    Extrait les ROI ACM gauche et droite avec mirroring.
    
    CONVENTION RADIOLOGIQUE:
    - L'image CT est vue comme si on regardait le patient de face (vue axiale)
    - ACM_g (classe 3) = Artère Cérébrale Moyenne GAUCHE du patient
      → Apparaît sur le CÔTÉ DROIT de l'image
    - ACM_d (classe 2) = Artère Cérébrale Moyenne DROITE du patient
      → Apparaît sur le CÔTÉ GAUCHE de l'image
    
    Cette convention est standard en imagerie médicale (vue "as if standing at 
    the foot of the patient's bed looking toward the head").
    
    Args:
        ct_img: Image CT originale (H, W)
        pred_mask: Masque de segmentation (H, W)
    
    Returns:
        tuple: (roi_gauche, roi_droite_miroir) ou (None, None) si ROI manquantes
    """
    ID_G = 3  # ACM gauche (hémisphère gauche du patient, côté droit de l'image)
    ID_D = 2  # ACM droite (hémisphère droit du patient, côté gauche de l'image)
    
    mask_g = (pred_mask == ID_G).astype(np.uint8)
    mask_d = (pred_mask == ID_D).astype(np.uint8)
    
    if np.sum(mask_g) == 0 or np.sum(mask_d) == 0:
        return None, None
    
    ys_g, xs_g = np.where(mask_g)
    ys_d, xs_d = np.where(mask_d)
    
    h = max(ys_g.max() - ys_g.min() + 1, ys_d.max() - ys_d.min() + 1)
    w = max(xs_g.max() - xs_g.min() + 1, xs_d.max() - xs_d.min() + 1)
    
    roi_g = np.zeros((h, w), dtype=ct_img.dtype)
    roi_d = np.zeros((h, w), dtype=ct_img.dtype)
    
    off_y_g = (h - (ys_g.max() - ys_g.min() + 1)) // 2
    off_x_g = (w - (xs_g.max() - xs_g.min() + 1)) // 2
    cropped_g = ct_img[ys_g.min():ys_g.max()+1, xs_g.min():xs_g.max()+1]
    roi_g[off_y_g:off_y_g + cropped_g.shape[0], off_x_g:off_x_g + cropped_g.shape[1]] = cropped_g
    
    off_y_d = (h - (ys_d.max() - ys_d.min() + 1)) // 2
    off_x_d = (w - (xs_d.max() - xs_d.min() + 1)) // 2
    cropped_d = ct_img[ys_d.min():ys_d.max()+1, xs_d.min():xs_d.max()+1]
    roi_d[off_y_d:off_y_d + cropped_d.shape[0], off_x_d:off_x_d + cropped_d.shape[1]] = cropped_d
    
    roi_d_miroir = cv2.flip(roi_d, 1)
    
    return roi_g, roi_d_miroir


def calculer_vecteur_asymetrie(features_gauche, features_droite):
    """
    Calcule le vecteur d'asymétrie entre les features gauche et droite.
    
    Δ = |features_gauche - features_droite|
    
    Args:
        features_gauche: Dict des features de l'hémisphère gauche
        features_droite: Dict des features de l'hémisphère droit
    
    Returns:
        dict: Vecteur d'asymétrie (différences absolues)
    """
    asymetrie = {}
    all_keys = set(features_gauche.keys()) | set(features_droite.keys())
    
    for key in all_keys:
        val_g = features_gauche.get(key, 0)
        val_d = features_droite.get(key, 0)
        asymetrie[f'delta_{key}'] = abs(val_g - val_d)
    
    return asymetrie


def analyser_asymetrie_acm(image, mask):
    """
    Analyse complète de l'asymétrie entre ACM gauche et droite.
    
    Pipeline:
    1. Extraire les ROI ACM_g (id=3) et ACM_d (id=2) avec mirroring
    2. Calculer les features radiomiques (GLCM + GLRLM)
    3. Calculer le vecteur d'asymétrie
    
    Args:
        image: Image CT originale (H, W)
        mask: Masque de segmentation (H, W)
    
    Returns:
        dict: {
            'features_gauche': Features radiomiques ACM_g,
            'features_droite': Features radiomiques ACM_d,
            'asymetrie': Vecteur d'asymétrie,
            'rois': {'gauche': ROI_g, 'droite': ROI_d_miroir}
        } ou None si ROI manquantes
    """
    roi_gauche, roi_droite_miroir = extraire_roi_acm_miroir(image, mask)
    
    if roi_gauche is None:
        return None
    
    features_gauche = compute_all_radiomics_features(roi_gauche)
    features_droite = compute_all_radiomics_features(roi_droite_miroir)
    
    asymetrie = calculer_vecteur_asymetrie(features_gauche, features_droite)
    
    return {
        'features_gauche': features_gauche,
        'features_droite': features_droite,
        'asymetrie': asymetrie,
        'rois': {
            'gauche': roi_gauche,
            'droite': roi_droite_miroir
        }
    }


def asymetrie_vers_vecteur(asymetrie, selected_features):
    """
    Convertit le dictionnaire d'asymétrie en vecteur numpy pour le ML.
    
    Args:
        asymetrie: Dict avec delta_contrast, delta_energy, etc.
        selected_features: Liste des features sélectionnées (ex: ['delta_homogeneity', ...])
    
    Returns:
        numpy array de forme (N,) où N = len(selected_features)
    """
    deltas = []
    for feat in selected_features:
        feat_name = feat.replace("delta_", "")
        val = asymetrie.get(f'delta_{feat_name}', 0)
        deltas.append(val)
    return np.array(deltas)
