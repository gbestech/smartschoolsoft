from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'is_active', 'date_joined', 'last_login',
            'is_superuser', 'is_staff', 'password', 'confirm_password'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'date_joined': {'read_only': True},
            'last_login': {'read_only': True},
            'is_superuser': {'read_only': True},
            'is_staff': {'read_only': True},
        }
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def validate(self, data):
        # Password validation for new users
        if self.instance is None and 'password' not in data:
            raise serializers.ValidationError({"password": "This field is required for new users."})
        
        # Password validation when password is provided
        if 'password' in data:
            if 'confirm_password' not in data:
                raise serializers.ValidationError({"confirm_password": "This field is required when setting password."})
            
            if data['password'] != data['confirm_password']:
                raise serializers.ValidationError({"password": "Passwords do not match."})
            
            # Validate password strength
            try:
                validate_password(data['password'])
            except serializers.ValidationError as e:
                raise serializers.ValidationError({"password": list(e.messages)})
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password', None)
        
        # Create user
        user = User.objects.create(**validated_data)
        
        # Set password if provided
        if password:
            user.set_password(password)
            user.save()
        
        return user
    
    def update(self, instance, validated_data):
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'is_active', 'date_joined', 'last_login'
        ]