# sales/permissions.py
from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to delete, but anyone can read.
    """
    def has_permission(self, request, view):
        # Allow safe methods (GET, HEAD, OPTIONS) for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Allow POST, PUT, PATCH for authenticated users
        if request.method in ['POST', 'PUT', 'PATCH']:
            return request.user and request.user.is_authenticated
        
        # Only allow DELETE for admin users
        if request.method == 'DELETE':
            return request.user and request.user.is_staff
        
        return False

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff