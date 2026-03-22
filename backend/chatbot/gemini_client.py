"""
Client pour l'API OpenAI.

Ce module gère les interactions avec le chatbot afin de fournir
des explications médicales sur les résultats d'analyse.
"""

from openai import OpenAI
from django.conf import settings
from .prompts import SYSTEM_PROMPT, get_context_prompt


class GeminiChatbot:
    """Chatbot médical appuyé sur l'API OpenAI."""

    def __init__(self):
        """Initialise le client OpenAI."""
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.OPENAI_MODEL

        if not self.api_key:
            raise ValueError(
                "Clé API OpenAI non configurée. "
                "Veuillez définir OPENAI_API_KEY dans les variables d'environnement."
            )

        self.client = OpenAI(api_key=self.api_key)

        print(f"✅ Chatbot OpenAI initialisé (modèle: {self.model})")

    def get_response(self, user_message, context=None):
        """Génère une réponse à un message utilisateur."""
        messages = self._build_messages(user_message, context)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.4,
                max_tokens=500,
            )

            content = response.choices[0].message.content
            return content.strip() if content else ""

        except Exception as e:
            return (
                "Désolé, je rencontre une difficulté technique pour répondre à votre question. "
                f"Erreur: {str(e)}"
            )

    def _build_messages(self, user_message, context):
        """Construit la liste de messages pour l'appel OpenAI."""
        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            }
        ]

        if context:
            context_prompt = get_context_prompt(context)
            messages.append({
                "role": "system",
                "content": context_prompt,
            })

        messages.append({
            "role": "user",
            "content": user_message,
        })

        return messages

    def get_explanation(self, analysis_result):
        """Génère une explication automatique des résultats d'analyse."""
        context = {
            'has_stroke': analysis_result['has_stroke'],
            'probability': analysis_result['probability'],
            'affected_territory': analysis_result.get('affected_territory', 'none'),
            'glcm_features': analysis_result.get('glcm_features', {})
        }

        question = (
            "Peux-tu m'expliquer ces résultats de façon claire et rassurante ? "
            "Que signifient ces valeurs ?"
        )

        return self.get_response(question, context)
