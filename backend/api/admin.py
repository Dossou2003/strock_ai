"""
Configuration de l'interface d'administration Django.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Analysis, Result, ChatMessage, MedicalHistory


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Administration des utilisateurs."""
    list_display = ['email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'is_staff', 'created_at']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informations supplémentaires', {
            'fields': ('role', 'phone')
        }),
    )


@admin.register(Analysis)
class AnalysisAdmin(admin.ModelAdmin):
    """Administration des analyses."""
    list_display = ['id', 'user', 'status', 'processing_time', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'id']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    """Administration des résultats."""
    list_display = ['id', 'analysis', 'has_stroke', 'probability', 'affected_territory', 'created_at']
    list_filter = ['has_stroke', 'affected_territory', 'created_at']
    search_fields = ['analysis__id', 'analysis__user__email']
    readonly_fields = ['id', 'created_at']
    ordering = ['-created_at']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """Administration des messages chatbot."""
    list_display = ['user', 'analysis', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['user__email', 'message', 'response']
    readonly_fields = ['id', 'timestamp']
    ordering = ['-timestamp']


@admin.register(MedicalHistory)
class MedicalHistoryAdmin(admin.ModelAdmin):
    """Administration de l'historique médical."""
    list_display = ['user', 'total_analyses', 'stroke_count', 'updated_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    filter_horizontal = ['analyses']
    ordering = ['-updated_at']
