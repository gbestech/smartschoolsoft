from rest_framework import serializers
from .models import CustomerReport

class CustomerReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerReport
        fields = ['id', 'customer_name', 'report_date', 'message', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']