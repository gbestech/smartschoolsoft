# reports/serializers.py
from rest_framework import serializers
from .models import CustomerReport, Product

class CustomerReportSerializer(serializers.ModelSerializer):
    # Make products optional and handle Many-to-Many relationship properly
    products = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Product.objects.all(),
        required=False,  # Make it optional
        allow_empty=True  # Allow empty list
    )

    class Meta:
        model = CustomerReport
        fields = ['id', 'customer_name', 'report_date', 'message', 'products', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        print("=== CREATE METHOD CALLED ===")
        print("Validated data:", validated_data)
        
        # Extract products from validated_data
        products_data = validated_data.pop('products', [])
        print("Products data:", products_data)
        
        try:
            # Create the report instance
            report = CustomerReport.objects.create(**validated_data)
            print("Report created:", report.id)
            
            # Add products to the Many-to-Many relationship
            if products_data:
                report.products.set(products_data)
                print(f"Added {len(products_data)} products to report")
            else:
                print("No products to add")
            
            return report
            
        except Exception as e:
            print(f"Error in create method: {str(e)}")
            raise e
        
        
        # serializers.py
class CustomerReportSerializer(serializers.ModelSerializer):
    products = serializers.PrimaryKeyRelatedField(many=True, queryset=Product.objects.all(), required=False)
    
    # Add this field to get product names
    product_names = serializers.SerializerMethodField()

    class Meta:
        model = CustomerReport
        fields = ['id', 'customer_name', 'report_date', 'message', 'products', 'product_names', 'created_at']
        read_only_fields = ['id', 'created_at', 'product_names']

    def get_product_names(self, obj):
        # Return list of product names
        return [product.name for product in obj.products.all()]