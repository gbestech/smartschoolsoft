from django.shortcuts import render

# Create your views here.
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from .models import CustomUser

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