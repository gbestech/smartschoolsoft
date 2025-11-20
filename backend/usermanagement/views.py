from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from .models import CustomUser
from .serializers import UserSerializer, UserListSerializer

User = get_user_model()

class IsAdminOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_superuser or 
            request.user.user_type in ['admin', 'manager']
        )

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user_type', 'is_active', 'is_staff']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer
    
    def get_queryset(self):
        # Non-admin users can only see limited information
        if self.request.user.is_superuser or self.request.user.user_type == 'admin':
            return User.objects.all().order_by('-date_joined')
        elif self.request.user.user_type == 'manager':
            # Managers can see all users except other admins
            return User.objects.filter(is_superuser=False).order_by('-date_joined')
        else:
            # Other users can only see their own profile
            return User.objects.filter(id=self.request.user.id)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check permissions for creating admin users
        user_type = request.data.get('user_type', 'user')
        if user_type == 'admin' and not request.user.is_superuser:
            return Response(
                {'error': 'Only superusers can create admin users.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Check permissions for updating to admin role
        user_type = request.data.get('user_type')
        if user_type == 'admin' and not request.user.is_superuser:
            return Response(
                {'error': 'Only superusers can assign admin role.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        self.perform_update(serializer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        if user == request.user:
            return Response(
                {'error': 'You cannot activate your own account'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        user.is_active = True
        user.save()
        return Response({'status': 'user activated'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        if user == request.user:
            return Response(
                {'error': 'You cannot deactivate your own account'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        if user.is_superuser:
            return Response(
                {'error': 'Cannot deactivate admin users'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        user.is_active = False
        user.save()
        return Response({'status': 'user deactivated'})
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance == request.user:
            return Response(
                {'error': 'You cannot delete your own account'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        if instance.is_superuser:
            return Response(
                {'error': 'Cannot delete admin users'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)