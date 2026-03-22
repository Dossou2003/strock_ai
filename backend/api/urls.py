"""
URLs de l'API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, LoginView, MeView,
    AnalysisViewSet, ResultViewSet, result_by_analysis,
    ChatMessageViewSet, MedicalHistoryViewSet,
    statistics_overview, model_performance
)

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'analysis', AnalysisViewSet, basename='analysis')
router.register(r'results', ResultViewSet, basename='result')
router.register(r'chatbot', ChatMessageViewSet, basename='chatbot')
router.register(r'history', MedicalHistoryViewSet, basename='history')

urlpatterns = [
    # Authentification
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='me'),
    
    # Résultat par analyse
    path('results/analysis/<uuid:analysis_id>/', result_by_analysis, name='result-by-analysis'),
    
    # Statistiques
    path('stats/overview/', statistics_overview, name='stats-overview'),
    path('stats/performance/', model_performance, name='stats-performance'),
    
    # Inclure les routes du router
    path('', include(router.urls)),
]
