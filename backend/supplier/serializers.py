from rest_framework import serializers
from .models import Supplier


class SupplierSerializer(serializers.ModelSerializer):
    """
    Serializer for Supplier model with additional computed fields
    """
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    full_address = serializers.CharField(source='get_full_address', read_only=True)
    is_active_status = serializers.BooleanField(source='is_active', read_only=True)
    
    class Meta:
        model = Supplier
        fields = [
            'id',
            'name',
            'type',
            'type_display',
            'email',
            'phone',
            'website',
            'address',
            'city',
            'state',
            'country',
            'postal_code',
            'full_address',
            'company_name',
            'tax_id',
            'registration_number',
            'contact_person',
            'contact_position',
            'bank_name',
            'account_number',
            'account_name',
            'status',
            'status_display',
            'is_active_status',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if self.instance:
            # Update case - exclude current instance
            if Supplier.objects.exclude(pk=self.instance.pk).filter(email=value).exists():
                raise serializers.ValidationError("A supplier with this email already exists.")
        else:
            # Create case
            if Supplier.objects.filter(email=value).exists():
                raise serializers.ValidationError("A supplier with this email already exists.")
        return value
    
    def validate_phone(self, value):
        """Basic phone validation"""
        if value and len(value) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits.")
        return value


class SupplierListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing suppliers
    """
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Supplier
        fields = [
            'id',
            'name',
            'type',
            'type_display',
            'email',
            'phone',
            'city',
            'state',
            'company_name',
            'contact_person',
            'status',
            'status_display',
            'created_at',
        ]