# from rest_framework import serializers
# from .models import CustomerReport

# class CustomerReportSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CustomerReport
#         fields = ['id', 'customer_name', 'report_date', 'message', 'created_at', 'updated_at']
#         read_only_fields = ['id', 'created_at', 'updated_at'


from rest_framework import serializers
from .models import CustomerReport
from product.models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name']

# class CustomerReportSerializer(serializers.ModelSerializer):
#     products = serializers.PrimaryKeyRelatedField(
#         queryset=Product.objects.all(),
#         many=True
#     )

#     class Meta:
#         model = CustomerReport
#         fields = ['id', 'customer_name', 'report_date', 'message', 'products', 'created_at']
        
        
        
from rest_framework import serializers
from .models import CustomerReport

class CustomerReportSerializer(serializers.ModelSerializer):
    products = serializers.StringRelatedField(many=True)

    class Meta:
        model = CustomerReport
        fields = '__all__'

