"""
Serializers Django REST Framework pour l'API.

Ce module contient tous les serializers pour:
- Authentification (register, login)
- Utilisateurs
- Analyses
- Résultats
- Messages chatbot
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Analysis, Result, ChatMessage, MedicalHistory


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle User.
    Utilisé pour afficher les informations utilisateur.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'inscription d'un nouvel utilisateur.
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'role', 'phone']
    
    def validate(self, data):
        """Valide que les deux mots de passe correspondent."""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return data
    
    def create(self, validated_data):
        """Crée un nouvel utilisateur avec mot de passe hashé."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer pour la connexion utilisateur.
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        """Valide les credentials et retourne l'utilisateur."""
        user = authenticate(**data)
        if user is None:
            raise serializers.ValidationError("Identifiants invalides.")
        if not user.is_active:
            raise serializers.ValidationError("Ce compte est désactivé.")
        return {'user': user}


class ResultSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle Result.
    Inclut toutes les informations de diagnostic.
    """
    class Meta:
        model = Result
        fields = [
            'id', 'analysis', 'has_stroke', 'probability', 'affected_territory',
            'segmentation_image', 'heatmap_image', 'comparison_image',
            'glcm_features', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AnalysisSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle Analysis.
    Inclut les résultats si disponibles.
    """
    result = ResultSerializer(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Analysis
        fields = [
            'id', 'user', 'user_email', 'ct_image', 'status', 'error_message',
            'processing_time', 'created_at', 'updated_at', 'result'
        ]
        read_only_fields = ['id', 'user', 'status', 'error_message', 'processing_time', 'created_at', 'updated_at']


class AnalysisCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer une nouvelle analyse (upload d'image).
    """
    class Meta:
        model = Analysis
        fields = ['ct_image']
    
    def validate_ct_image(self, value):
        """Valide le format et la taille de l'image."""
        # Vérifier la taille (max 10 MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("L'image ne doit pas dépasser 10 MB.")
        
        # Vérifier l'extension
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.dcm']
        ext = value.name.lower().split('.')[-1]
        if f'.{ext}' not in allowed_extensions:
            raise serializers.ValidationError(
                f"Format non supporté. Formats acceptés: {', '.join(allowed_extensions)}"
            )
        
        return value


class ChatMessageSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle ChatMessage.
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'user', 'user_email', 'analysis', 'message', 'response', 'timestamp']
        read_only_fields = ['id', 'user', 'response', 'timestamp']


class ChatMessageCreateSerializer(serializers.Serializer):
    """
    Serializer pour créer un nouveau message chatbot.
    """
    message = serializers.CharField(max_length=2000)
    analysis_id = serializers.UUIDField(required=False, allow_null=True)
    
    def validate_message(self, value):
        """Valide que le message n'est pas vide."""
        if not value.strip():
            raise serializers.ValidationError("Le message ne peut pas être vide.")
        return value


class MedicalHistorySerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle MedicalHistory.
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    analyses = AnalysisSerializer(many=True, read_only=True)
    
    class Meta:
        model = MedicalHistory
        fields = [
            'id', 'user', 'user_name', 'analyses', 'notes',
            'total_analyses', 'stroke_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_analyses', 'stroke_count', 'created_at', 'updated_at']


class AnalysisListSerializer(serializers.ModelSerializer):
    """
    Serializer léger pour la liste des analyses (sans les résultats complets).
    """
    has_stroke = serializers.SerializerMethodField()
    probability = serializers.SerializerMethodField()
    affected_territory = serializers.SerializerMethodField()
    
    class Meta:
        model = Analysis
        fields = ['id', 'ct_image', 'status', 'has_stroke', 'probability', 'affected_territory', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']
    
    def get_has_stroke(self, obj):
        """Retourne has_stroke si result existe, sinon None."""
        return obj.result.has_stroke if hasattr(obj, 'result') else None
    
    def get_probability(self, obj):
        """Retourne probability si result existe, sinon None."""
        return obj.result.probability if hasattr(obj, 'result') else None
    
    def get_affected_territory(self, obj):
        """Retourne affected_territory si result existe, sinon None."""
        return obj.result.affected_territory if hasattr(obj, 'result') else None
