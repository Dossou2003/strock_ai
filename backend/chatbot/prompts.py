"""
Prompts système pour le chatbot Gemini.

Ce module contient les prompts qui définissent le comportement du chatbot.
"""

SYSTEM_PROMPT = """Tu es un assistant médical spécialisé en neurologie et en AVC (Accident Vasculaire Cérébral).

Ton rôle est d'expliquer les résultats d'analyse d'images CT cérébrales de façon:
- Claire et accessible (évite le jargon médical complexe)
- Rassurante et empathique
- Factuelle et basée sur les données fournies
- Éducative (explique les concepts médicaux)

IMPORTANT:
- Tu NE POSES PAS de diagnostic définitif
- Tu expliques les résultats de l'analyse IA
- Tu recommandes TOUJOURS de consulter un médecin pour un diagnostic officiel
- En cas de résultat positif (AVC détecté), tu insistes sur l'urgence de consulter
- Tu réponds en français

Contexte médical:
- L'effacement des sillons corticaux est un signe précoce d'AVC ischémique
- Il se manifeste par une perte de texture visible sur les images CT
- L'analyse utilise la comparaison d'asymétrie entre les hémisphères gauche et droite
- Les features GLCM (contrast, energy, homogeneity, correlation, entropy) mesurent la texture

Ton ton doit être:
- Professionnel mais accessible
- Empathique et rassurant
- Encourageant à consulter un professionnel de santé
"""


def get_context_prompt(context):
    """
    Génère un prompt de contexte basé sur les résultats d'analyse.
    
    Args:
        context: Dict contenant:
            - has_stroke: bool
            - probability: float
            - affected_territory: str
            - glcm_features: dict
    
    Returns:
        str: Prompt de contexte formaté
    """
    has_stroke = context.get('has_stroke', False)
    probability = context.get('probability', 0.0)
    territory = context.get('affected_territory', 'none')
    features = context.get('glcm_features', {})
    
    # Construire le contexte
    context_parts = ["\n\nContexte de l'analyse actuelle:"]
    
    # Résultat principal
    if has_stroke:
        context_parts.append(f"- ⚠️ AVC DÉTECTÉ avec une probabilité de {probability:.1%}")
        context_parts.append(f"- Territoire affecté: {territory}")
        context_parts.append("- URGENCE: Recommander une consultation médicale immédiate")
    else:
        context_parts.append(f"- ✅ Pas d'AVC détecté (probabilité: {probability:.1%})")
        context_parts.append("- Les territoires vasculaires semblent normaux")
    
    # Features GLCM si disponibles
    if features:
        context_parts.append("\nFeatures de texture GLCM:")
        
        if 'asymetrie' in features:
            asym = features['asymetrie']
            context_parts.append(f"  - Asymétrie de contraste: {asym.get('delta_contrast', 0):.3f}")
            context_parts.append(f"  - Asymétrie d'entropie: {asym.get('delta_entropy', 0):.3f}")
            context_parts.append(f"  - Asymétrie d'homogénéité: {asym.get('delta_homogeneity', 0):.3f}")
        
        if 'gauche' in features and 'droite' in features:
            context_parts.append("\nComparaison hémisphères:")
            context_parts.append(f"  - Entropie gauche: {features['gauche'].get('entropy', 0):.3f}")
            context_parts.append(f"  - Entropie droite: {features['droite'].get('entropy', 0):.3f}")
    
    return "\n".join(context_parts)


# Prompts prédéfinis pour questions fréquentes
FAQ_PROMPTS = {
    "qu_est_ce_qu_un_avc": """
Un AVC (Accident Vasculaire Cérébral) est une urgence médicale qui survient lorsque 
la circulation sanguine vers une partie du cerveau est interrompue. Il existe deux types:

1. AVC ischémique (80% des cas): Un caillot bloque une artère cérébrale
2. AVC hémorragique (20% des cas): Rupture d'un vaisseau sanguin

Signes d'alerte (règle FAST):
- F (Face): Visage affaissé d'un côté
- A (Arms): Faiblesse d'un bras
- S (Speech): Difficulté à parler
- T (Time): Appeler le 15 immédiatement

L'effacement des sillons corticaux est un signe précoce visible sur les images CT.
""",
    
    "effacement_sillons": """
L'effacement des sillons corticaux est un signe radiologique précoce d'AVC ischémique.

Les sillons sont les "rainures" à la surface du cerveau. En cas d'AVC:
1. Un œdème (gonflement) se forme dans la zone affectée
2. Cet œdème comprime les sillons
3. Les sillons deviennent moins visibles ou "effacés"

Sur les images CT, cela se manifeste par:
- Une perte de contraste entre les sillons et le cortex
- Une diminution de la texture visible
- Une asymétrie entre les deux hémisphères

Notre analyse utilise des algorithmes d'IA pour détecter ces changements subtils.
""",
    
    "glcm_explication": """
GLCM (Gray-Level Co-occurrence Matrix) est une méthode d'analyse de texture.

Elle mesure comment les pixels voisins sont distribués dans l'image:

1. Contrast: Variations locales d'intensité
   - Élevé = texture rugueuse
   - Faible = texture lisse

2. Energy: Uniformité de la texture
   - Élevée = texture répétitive
   - Faible = texture variée

3. Homogeneity: Proximité des éléments
   - Élevée = texture homogène
   - Faible = texture hétérogène

4. Entropy: Désordre/complexité
   - Élevée = texture complexe
   - Faible = texture simple

En cas d'AVC, l'effacement des sillons réduit la complexité de la texture.
"""
}
