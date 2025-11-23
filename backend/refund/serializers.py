from rest_framework import serializers
from .models import RefundRequest, RefundItem

class RefundItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='sale_item.product_name', read_only=True)
    product_price = serializers.DecimalField(source='sale_item.product_price', read_only=True, max_digits=10, decimal_places=2)
    
    class Meta:
        model = RefundItem
        fields = ['id', 'sale_item', 'product_name', 'product_price', 'quantity']

class RefundRequestSerializer(serializers.ModelSerializer):
    sale_number = serializers.CharField(source='sale.sale_number', read_only=True)
    customer_name = serializers.CharField(source='sale.customer_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    refunded_items = RefundItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = RefundRequest
        fields = [
            'id', 'sale', 'sale_number', 'customer_name', 'reason',
            'requested_amount', 'refunded_amount', 'status', 'is_partial',
            'created_by', 'created_by_name', 'approved_by', 'approved_by_name',
            'created_at', 'approved_at', 'processed_at', 'refunded_items'
        ]
        read_only_fields = ['created_by', 'approved_by', 'created_at', 'approved_at', 'processed_at']

class RefundItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RefundItem
        fields = ['sale_item', 'quantity']

class RefundRequestCreateSerializer(serializers.ModelSerializer):
    refunded_items = RefundItemCreateSerializer(many=True, required=False)
    
    class Meta:
        model = RefundRequest
        fields = ['sale', 'reason', 'requested_amount', 'is_partial', 'refunded_items']
    
    def create(self, validated_data):
        refunded_items_data = validated_data.pop('refunded_items', [])
        refund_request = RefundRequest.objects.create(**validated_data)
        
        for item_data in refunded_items_data:
            RefundItem.objects.create(refund_request=refund_request, **item_data)
        
        return refund_request

class ProcessRefundSerializer(serializers.Serializer):
    refund_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    restore_products = serializers.BooleanField(default=True)

class ApproveRejectSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(required=False, allow_blank=True)