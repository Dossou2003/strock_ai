"""
Permissions personnalisées pour l'API.
"""

from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée pour autoriser uniquement le propriétaire à modifier un objet.
    """
    def has_object_permission(self, request, view, obj):
        # Les requêtes de lecture sont autorisées pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Les requêtes d'écriture sont autorisées uniquement au propriétaire
        return obj.user == request.user


class IsOwner(permissions.BasePermission):
    """
    Permission pour autoriser uniquement le propriétaire à accéder à un objet.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsDoctorOrAdmin(permissions.BasePermission):
    """
    Permission pour autoriser uniquement les médecins et administrateurs.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['doctor', 'admin']
