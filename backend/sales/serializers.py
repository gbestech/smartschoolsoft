from rest_framework import serializers
from .models import Sale, SaleItem, Refund
from rest_framework import serializers

class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = '__all__'

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Sale
        fields = '__all__'
        
        
 # sales/serializers.py


class RefundSerializer(serializers.ModelSerializer):
    sale_id = serializers.IntegerField(source='sale.id', read_only=True)
    customer_name = serializers.CharField(source='sale.customer_name', read_only=True)
    sale_total = serializers.DecimalField(source='sale.total', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Refund
        fields = [
            'id', 'sale', 'sale_id', 'customer_name', 'sale_total',
            'reason', 'refund_amount', 'refund_date', 'processed_by',
            'items_refunded', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        # Validate refund amount doesn't exceed sale amount paid
        sale = data.get('sale')
        refund_amount = data.get('refund_amount')
        
        if sale and refund_amount:
            if refund_amount > sale.amount_paid:
                raise serializers.ValidationError({
                    'refund_amount': f'Refund amount (₦{refund_amount}) cannot exceed amount paid (₦{sale.amount_paid})'
                })
        
        return data       