# from django.shortcuts import render

# # Create your views here.
# from rest_framework import status, permissions
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.authtoken.models import Token
# from django.contrib.auth import login, logout
# from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
# from .models import CustomUser

# @api_view(['POST'])
# @permission_classes([permissions.AllowAny])
# def register_view(request):
#     serializer = UserRegistrationSerializer(data=request.data)
#     if serializer.is_valid():
#         user = serializer.save()
#         token, created = Token.objects.get_or_create(user=user)
#         return Response({
#             'token': token.key,
#             'user': UserSerializer(user).data
#         }, status=status.HTTP_201_CREATED)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['POST'])
# @permission_classes([permissions.AllowAny])
# def login_view(request):
#     serializer = UserLoginSerializer(data=request.data)
#     if serializer.is_valid():
#         user = serializer.validated_data['user']
#         token, created = Token.objects.get_or_create(user=user)
#         login(request, user)
#         return Response({
#             'token': token.key,
#             'user': UserSerializer(user).data
#         }, status=status.HTTP_200_OK)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['POST'])
# def logout_view(request):
#     logout(request)
#     return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)

# @api_view(['GET'])
# def user_dashboard(request):
#     user = request.user
#     if user.user_type == 'admin':
#         # Admin can see all users
#         users = CustomUser.objects.all()
#         return Response({
#             'message': 'Admin Dashboard',
#             'users': UserSerializer(users, many=True).data
#         })
#     else:
#         # Regular user sees only their info
#         return Response({
#             'message': 'User Dashboard',
#             'user': UserSerializer(user).data
#         })

# @api_view(['GET'])
# def get_user_profile(request):
#     return Response(UserSerializer(request.user).data)

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.shortcuts import get_object_or_404
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from .models import CustomUser

# Your existing views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        login(request, user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def user_dashboard(request):
    user = request.user
    if user.user_type == 'admin':
        # Admin can see all users
        users = CustomUser.objects.all()
        return Response({
            'message': 'Admin Dashboard',
            'users': UserSerializer(users, many=True).data
        })
    else:
        # Regular user sees only their info
        return Response({
            'message': 'User Dashboard',
            'user': UserSerializer(user).data
        })

@api_view(['GET'])
def get_user_profile(request):
    return Response(UserSerializer(request.user).data)

# NEW USER MANAGEMENT VIEWS

@api_view(['GET'])
def user_list(request):
    """Get all users (admin only)"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if request.user.user_type != 'admin' and not request.user.is_superuser:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    users = CustomUser.objects.all().order_by('-date_joined')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_user(request):
    """Create new user (admin only)"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if request.user.user_type != 'admin' and not request.user.is_superuser:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def user_detail(request, user_id):
    """Get, update, or delete specific user (admin only)"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if request.user.user_type != 'admin' and not request.user.is_superuser:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    user = get_object_or_404(CustomUser, id=user_id)
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        # Prevent users from modifying their own admin status
        if user == request.user and 'user_type' in request.data:
            if request.data.get('user_type') != request.user.user_type:
                return Response({'error': 'Cannot change your own role'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = UserSerializer(user, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Prevent users from deleting themselves
        if user == request.user:
            return Response({'error': 'Cannot delete your own account'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Prevent deletion of other admin users
        if (user.user_type == 'admin' or user.is_superuser) and user != request.user:
            return Response({'error': 'Cannot delete admin users'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def toggle_user_status(request, user_id):
    """Activate/Deactivate user (admin only)"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if request.user.user_type != 'admin' and not request.user.is_superuser:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    user = get_object_or_404(CustomUser, id=user_id)
    
    # Prevent users from deactivating themselves
    if user == request.user:
        return Response({'error': 'Cannot deactivate your own account'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Prevent deactivation of other admin users
    if (user.user_type == 'admin' or user.is_superuser) and user != request.user:
        return Response({'error': 'Cannot deactivate admin users'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.is_active = not user.is_active
    user.save()
    
    action = "activated" if user.is_active else "deactivated"
    return Response({'message': f'User {action} successfully', 'is_active': user.is_active})

@api_view(['POST'])
def change_user_role(request, user_id):
    """Change user role (admin only)"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if request.user.user_type != 'admin' and not request.user.is_superuser:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    user = get_object_or_404(CustomUser, id=user_id)
    
    # Prevent users from changing their own role
    if user == request.user:
        return Response({'error': 'Cannot change your own role'}, status=status.HTTP_400_BAD_REQUEST)
    
    new_role = request.data.get('user_type')
    if not new_role:
        return Response({'error': 'user_type field is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    valid_roles = ['user', 'staff', 'inspector', 'manager', 'admin']
    if new_role not in valid_roles:
        return Response({'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.user_type = new_role
    user.save()
    
    return Response({'message': f'User role changed to {new_role}', 'user_type': user.user_type})