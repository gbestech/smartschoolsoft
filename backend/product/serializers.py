from django.contrib.auth import get_user_model
from .models import Product
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile
User = get_user_model()

class ProductSerializer(serializers.ModelSerializer):
    profit = serializers.ReadOnlyField()
    profit_margin = serializers.ReadOnlyField()
    created_by_username = serializers.ReadOnlyField(source='created_by.username')
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'selling_price', 
            'quantity', 'category', 'created_by', 'created_by_username',
            'created_at', 'updated_at', 'profit', 'profit_margin'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'price', 'selling_price', 
            'quantity', 'category'
        ]
    
    def validate(self, data):
        # Validate that selling price is greater than cost price
        if data['selling_price'] <= data['price']:
            raise serializers.ValidationError(
                "Selling price must be greater than cost price"
            )
        
        # Validate that quantity is positive
        if data['quantity'] < 0:
            raise serializers.ValidationError(
                "Quantity cannot be negative"
            )
        
        return data
    
    
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile

# Use get_user_model() instead of direct User import
User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'user_type', 'passport_number', 'date_of_birth', 
            'gender', 'phone_number', 'profile_picture',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'profile', 'date_joined'
        ]
        read_only_fields = ['id', 'username', 'date_joined']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        # Update User fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        # Update Profile fields
        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()

        return instance

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    user_type = serializers.CharField(write_only=True, required=False, default='user')
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2', 
            'user_type', 'first_name', 'last_name'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user_type = validated_data.pop('user_type', 'user')
        validated_data.pop('password2')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Update user profile with user_type
        user.profile.user_type = user_type
        user.profile.save()
        
        return user

class ProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['profile_picture']

    def update(self, instance, validated_data):
        # Delete old profile picture if exists
        if instance.profile_picture:
            instance.profile_picture.delete()
        
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.save()
        return instance