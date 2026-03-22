"""
Modèles de base de données pour l'application de détection d'AVC.

Ce module contient tous les modèles Django pour:
- Utilisateurs (extension du modèle User)
- Analyses d'images CT
- Résultats de détection
- Historique des conversations chatbot
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
import uuid


class User(AbstractUser):
    """
    Modèle utilisateur étendu avec rôles et informations supplémentaires.
    """
    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('doctor', 'Médecin'),
        ('admin', 'Administrateur'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"


class Analysis(models.Model):
    """
    Modèle pour une analyse d'image CT.
    Contient l'image uploadée et le statut du traitement.
    """
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('processing', 'En cours'),
        ('completed', 'Terminé'),
        ('failed', 'Échoué'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analyses')
    ct_image = models.ImageField(
        upload_to='uploads/%Y/%m/%d/',
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'dcm'])]
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True, null=True)
    processing_time = models.FloatField(null=True, blank=True, help_text="Temps de traitement en secondes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Analyse'
        verbose_name_plural = 'Analyses'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Analyse {self.id} - {self.user.email} - {self.status}"


class Result(models.Model):
    """
    Modèle pour les résultats d'une analyse.
    Contient le diagnostic, les probabilités et les images générées.
    """
    TERRITORY_CHOICES = [
        ('none', 'Aucun'),
        ('ACM_g', 'ACM Gauche'),
        ('ACM_d', 'ACM Droite'),
        ('ACA', 'ACA'),
        ('ACP', 'ACP'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.OneToOneField(Analysis, on_delete=models.CASCADE, related_name='result')
    
    # Diagnostic
    has_stroke = models.BooleanField(default=False, help_text="AVC détecté ou non")
    probability = models.FloatField(help_text="Probabilité d'AVC (0-1)")
    affected_territory = models.CharField(max_length=20, choices=TERRITORY_CHOICES, default='none')
    
    # Images générées
    segmentation_image = models.ImageField(
        upload_to='results/segmentation/%Y/%m/%d/',
        null=True,
        blank=True
    )
    heatmap_image = models.ImageField(
        upload_to='results/heatmap/%Y/%m/%d/',
        null=True,
        blank=True
    )
    comparison_image = models.ImageField(
        upload_to='results/comparison/%Y/%m/%d/',
        null=True,
        blank=True
    )
    
    # Features GLCM (stockées en JSON)
    glcm_features = models.JSONField(
        help_text="Features GLCM: contrast, energy, homogeneity, correlation, entropy"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Résultat'
        verbose_name_plural = 'Résultats'
        ordering = ['-created_at']
    
    def __str__(self):
        stroke_status = "AVC détecté" if self.has_stroke else "Normal"
        return f"Résultat {self.id} - {stroke_status} ({self.probability:.2%})"


class ChatMessage(models.Model):
    """
    Modèle pour l'historique des conversations avec le chatbot Gemini.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    analysis = models.ForeignKey(
        Analysis,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chat_messages',
        help_text="Analyse associée (optionnel)"
    )
    
    # Conversation
    message = models.TextField(help_text="Message de l'utilisateur")
    response = models.TextField(help_text="Réponse du chatbot")
    
    # Métadonnées
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Message Chatbot'
        verbose_name_plural = 'Messages Chatbot'
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Chat {self.user.email} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"


class MedicalHistory(models.Model):
    """
    Modèle pour l'historique médical d'un patient.
    Regroupe toutes les analyses d'un utilisateur.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='medical_history')
    analyses = models.ManyToManyField(Analysis, related_name='medical_histories', blank=True)
    notes = models.TextField(blank=True, help_text="Notes médicales")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Historique Médical'
        verbose_name_plural = 'Historiques Médicaux'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Historique de {self.user.get_full_name()}"
    
    @property
    def total_analyses(self):
        """Retourne le nombre total d'analyses."""
        return self.analyses.count()
    
    @property
    def stroke_count(self):
        """Retourne le nombre d'AVC détectés."""
        return self.analyses.filter(result__has_stroke=True).count()
