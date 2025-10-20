from rest_framework import serializers
from .models import CustomerReport
from product.models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name']      
        
from rest_framework import serializers
from .models import CustomerReport

class CustomerReportSerializer(serializers.ModelSerializer):
    products = serializers.StringRelatedField(many=True)

    class Meta:
        model = CustomerReport
        fields = '__all__'