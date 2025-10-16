from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Product

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