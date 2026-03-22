"""
Views Django REST Framework pour l'API de détection d'AVC.

Ce module contient tous les endpoints API pour:
- Authentification (register, login, me)
- Analyses (upload, list, detail, status)
- Résultats (detail, images, PDF)
- Chatbot (message, history)
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.core.files import File
import os
import time

from .models import User, Analysis, Result, ChatMessage, MedicalHistory
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    AnalysisSerializer, AnalysisCreateSerializer, AnalysisListSerializer,
    ResultSerializer, ChatMessageSerializer, ChatMessageCreateSerializer,
    MedicalHistorySerializer
)
from .permissions import IsOwner, IsOwnerOrReadOnly, IsDoctorOrAdmin


# ==============================================================================
# AUTHENTIFICATION
# ==============================================================================

class RegisterView(APIView):
    """
    Endpoint pour l'inscription d'un nouvel utilisateur.
    POST /api/auth/register/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Endpoint pour la connexion utilisateur.
    POST /api/auth/login/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """
    Endpoint pour récupérer les informations de l'utilisateur connecté.
    GET /api/auth/me/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# ==============================================================================
# ANALYSES
# ==============================================================================

class AnalysisViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les analyses d'images CT.
    
    Endpoints:
    - GET /api/analysis/ : Liste des analyses de l'utilisateur
    - POST /api/analysis/ : Upload d'une nouvelle image
    - GET /api/analysis/{id}/ : Détails d'une analyse
    - DELETE /api/analysis/{id}/ : Supprimer une analyse
    - GET /api/analysis/{id}/status/ : Statut du traitement
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        """Retourne uniquement les analyses de l'utilisateur connecté."""
        return Analysis.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Utilise différents serializers selon l'action."""
        if self.action == 'create':
            return AnalysisCreateSerializer
        elif self.action == 'list':
            return AnalysisListSerializer
        return AnalysisSerializer
    
    def create(self, request):
        """
        Upload d'une nouvelle image CT pour analyse.
        POST /api/analysis/
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Créer l'analyse avec l'utilisateur connecté
            analysis = serializer.save(user=request.user)
            
            # Lancer le traitement en arrière-plan (simplifié pour l'instant)
            # TODO: Utiliser Celery pour traitement asynchrone
            self._process_analysis(analysis)
            
            return Response(
                AnalysisSerializer(analysis).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _process_analysis(self, analysis):
        """
        Traite l'analyse d'image (version simplifiée synchrone).
        En production, ceci devrait être une tâche Celery asynchrone.
        """
        try:
            # Mettre à jour le statut
            analysis.status = 'processing'
            analysis.save()
            
            start_time = time.time()
            
            # Importer le pipeline IA avec visualisations
            from ai_models.pipeline import analyze_ct_scan_with_visualization
            import os
            from django.core.files import File
            
            # Créer le dossier de sortie pour les visualisations
            output_dir = os.path.join(
                settings.MEDIA_ROOT, 
                'results', 
                str(analysis.id)
            )
            os.makedirs(output_dir, exist_ok=True)
            
            # Analyser l'image avec génération des visualisations
            result_data = analyze_ct_scan_with_visualization(
                analysis.ct_image.path,
                output_dir=output_dir
            )
            
            # Calculer le temps de traitement
            processing_time = time.time() - start_time
            
            # Créer le résultat avec les images
            result = Result(
                analysis=analysis,
                has_stroke=result_data['has_stroke'],
                probability=result_data['probability'],
                affected_territory=result_data.get('affected_territory', 'none'),
                glcm_features=result_data['radiomics_features'],
            )
            
            # Sauvegarder les images générées
            if 'segmentation_image_path' in result_data:
                with open(result_data['segmentation_image_path'], 'rb') as f:
                    result.segmentation_image.save(
                        f'segmentation_{analysis.id}.png',
                        File(f),
                        save=False
                    )
            
            if 'mask_image_path' in result_data:
                with open(result_data['mask_image_path'], 'rb') as f:
                    result.heatmap_image.save(
                        f'mask_{analysis.id}.png',
                        File(f),
                        save=False
                    )
            
            if 'comparison_image_path' in result_data:
                with open(result_data['comparison_image_path'], 'rb') as f:
                    result.comparison_image.save(
                        f'comparison_{analysis.id}.png',
                        File(f),
                        save=False
                    )
            
            result.save()
            
            # Mettre à jour l'analyse
            analysis.status = 'completed'
            analysis.processing_time = processing_time
            analysis.save()
            
        except Exception as e:
            # En cas d'erreur
            analysis.status = 'failed'
            analysis.error_message = str(e)
            analysis.save()
    
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """
        Récupère le statut du traitement d'une analyse.
        GET /api/analysis/{id}/status/
        """
        analysis = self.get_object()
        return Response({
            'id': analysis.id,
            'status': analysis.status,
            'processing_time': analysis.processing_time,
            'error_message': analysis.error_message,
        })


# ==============================================================================
# RÉSULTATS
# ==============================================================================

class ResultViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les résultats d'analyse (lecture seule).
    
    Endpoints:
    - GET /api/results/ : Liste des résultats
    - GET /api/results/{id}/ : Détails d'un résultat
    """
    serializer_class = ResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Retourne uniquement les résultats des analyses de l'utilisateur."""
        return Result.objects.filter(analysis__user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def result_by_analysis(request, analysis_id):
    """
    Récupère le résultat d'une analyse spécifique.
    GET /api/results/analysis/{analysis_id}/
    """
    analysis = get_object_or_404(Analysis, id=analysis_id, user=request.user)
    
    if not hasattr(analysis, 'result'):
        return Response(
            {'detail': 'Résultat non disponible. Analyse en cours ou échouée.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = ResultSerializer(analysis.result)
    return Response(serializer.data)


# ==============================================================================
# CHATBOT
# ==============================================================================

class ChatMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les messages chatbot.
    
    Endpoints:
    - GET /api/chatbot/ : Historique des messages
    - POST /api/chatbot/ : Envoyer un nouveau message
    - DELETE /api/chatbot/ : Effacer l'historique
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Retourne uniquement les messages de l'utilisateur connecté."""
        return ChatMessage.objects.filter(user=self.request.user)
    
    def create(self, request):
        """
        Envoie un message au chatbot et récupère la réponse.
        POST /api/chatbot/
        """
        serializer = ChatMessageCreateSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.validated_data['message']
            analysis_id = serializer.validated_data.get('analysis_id')
            
            # Récupérer le contexte si une analyse est fournie
            context = None
            analysis = None
            if analysis_id:
                try:
                    analysis = Analysis.objects.get(id=analysis_id, user=request.user)
                    if hasattr(analysis, 'result'):
                        context = {
                            'has_stroke': analysis.result.has_stroke,
                            'probability': analysis.result.probability,
                            'affected_territory': analysis.result.affected_territory,
                            'glcm_features': analysis.result.glcm_features,
                        }
                except Analysis.DoesNotExist:
                    pass
            
            # Obtenir la réponse du chatbot
            from chatbot.gemini_client import GeminiChatbot
            chatbot = GeminiChatbot()
            response = chatbot.get_response(message, context)
            
            # Sauvegarder le message
            chat_message = ChatMessage.objects.create(
                user=request.user,
                analysis=analysis,
                message=message,
                response=response
            )
            
            return Response(
                ChatMessageSerializer(chat_message).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """
        Efface l'historique des messages de l'utilisateur.
        DELETE /api/chatbot/clear/
        """
        count = self.get_queryset().delete()[0]
        return Response({
            'detail': f'{count} message(s) supprimé(s).'
        }, status=status.HTTP_200_OK)


# ==============================================================================
# HISTORIQUE MÉDICAL
# ==============================================================================

class MedicalHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour l'historique médical (lecture seule).
    
    Endpoints:
    - GET /api/history/ : Historique de l'utilisateur
    """
    serializer_class = MedicalHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Retourne uniquement l'historique de l'utilisateur connecté."""
        return MedicalHistory.objects.filter(user=self.request.user)


# ==============================================================================
# STATISTIQUES (Admin/Doctor)
# ==============================================================================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsDoctorOrAdmin])
def statistics_overview(request):
    """
    Vue d'ensemble des statistiques (réservé aux médecins et admins).
    GET /api/stats/overview/
    """
    total_analyses = Analysis.objects.count()
    completed_analyses = Analysis.objects.filter(status='completed').count()
    total_strokes = Result.objects.filter(has_stroke=True).count()
    
    return Response({
        'total_analyses': total_analyses,
        'completed_analyses': completed_analyses,
        'total_strokes': total_strokes,
        'stroke_rate': total_strokes / completed_analyses if completed_analyses > 0 else 0,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsDoctorOrAdmin])
def model_performance(request):
    """
    Métriques de performance du modèle (réservé aux médecins et admins).
    GET /api/stats/performance/
    """
    # TODO: Implémenter les métriques réelles (précision, recall, F1, AUC)
    return Response({
        'accuracy': 0.89,
        'precision': 0.87,
        'recall': 0.91,
        'f1_score': 0.89,
        'auc_roc': 0.92,
    })
