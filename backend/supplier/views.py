from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from .models import Supplier
from .serializers import SupplierSerializer, SupplierListSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Supplier CRUD operations with filtering and statistics
    """
    queryset = Supplier.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return SupplierListSerializer
        return SupplierSerializer
    
    def get_queryset(self):
        """
        Filter suppliers based on query parameters
        """
        queryset = Supplier.objects.all()
        
        # Search filter
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(company_name__icontains=search) |
                Q(city__icontains=search) |
                Q(state__icontains=search)
            )
        
        # Status filter
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Type filter
        type_filter = self.request.query_params.get('type', None)
        if type_filter:
            queryset = queryset.filter(type=type_filter)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Create new supplier with detailed response"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(
            {
                'message': 'Supplier created successfully',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        """Update supplier with detailed response"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(
            {
                'message': 'Supplier updated successfully',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    def destroy(self, request, *args, **kwargs):
        """Delete supplier with confirmation message"""
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return Response(
            {'message': 'Supplier deleted successfully'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get supplier statistics
        GET /api/suppliers/stats/
        """
        total_suppliers = Supplier.objects.count()
        active_suppliers = Supplier.objects.filter(status='active').count()
        inactive_suppliers = Supplier.objects.filter(status='inactive').count()
        suspended_suppliers = Supplier.objects.filter(status='suspended').count()
        
        # Suppliers by type
        suppliers_by_type = Supplier.objects.values('type').annotate(
            count=Count('id')
        )
        
        stats_data = {
            'total_suppliers': total_suppliers,
            'active_suppliers': active_suppliers,
            'inactive_suppliers': inactive_suppliers,
            'suspended_suppliers': suspended_suppliers,
            'by_type': {item['type']: item['count'] for item in suppliers_by_type},
        }
        
        return Response(stats_data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activate a supplier
        POST /api/suppliers/{id}/activate/
        """
        supplier = self.get_object()
        supplier.status = 'active'
        supplier.save()
        
        serializer = self.get_serializer(supplier)
        return Response(
            {
                'message': 'Supplier activated successfully',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivate a supplier
        POST /api/suppliers/{id}/deactivate/
        """
        supplier = self.get_object()
        supplier.status = 'inactive'
        supplier.save()
        
        serializer = self.get_serializer(supplier)
        return Response(
            {
                'message': 'Supplier deactivated successfully',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """
        Suspend a supplier
        POST /api/suppliers/{id}/suspend/
        """
        supplier = self.get_object()
        supplier.status = 'suspended'
        supplier.save()
        
        serializer = self.get_serializer(supplier)
        return Response(
            {
                'message': 'Supplier suspended successfully',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )
