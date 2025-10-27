from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import CustomerReport
from .serializers import CustomerReportSerializer
from product.models import Product  # ✅ fixed the typo
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count
from .models import CustomerReport
from django.utils import timezone
from datetime import timedelta

# -------------------------------
# Customer Report Views
# -------------------------------
from .serializers import CustomerReportSerializer

class CreateCustomerReportView(generics.CreateAPIView):
    queryset = CustomerReport.objects.all()
    serializer_class = CustomerReportSerializer
    
class CustomerReportListCreateView(generics.ListCreateAPIView):
    queryset = CustomerReport.objects.all()
    serializer_class = CustomerReportSerializer


class CustomerReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomerReport.objects.all()
    serializer_class = CustomerReportSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def create_report(request):
    serializer = CustomerReportSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'message': 'Report submitted successfully!'}, status=201)
    return Response({'success': False, 'errors': serializer.errors}, status=400)
# -------------------------------
# Product List View
# -------------------------------
def product_list(request):
    products = Product.objects.all().values("id", "name", "price", "description")
    return JsonResponse(list(products), safe=False)


# views.py
@api_view(['GET'])
def report_list(request):
    try:
        reports = CustomerReport.objects.all().order_by('-created_at')
        serializer = CustomerReportSerializer(reports, many=True)
        
        return Response({
            'count': reports.count(),
            'reports': serializer.data
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
# views.py


@api_view(['GET'])
def report_count(request):
    """
    Get total counts for reports and customers
    """
    try:
        # Total reports count
        total_reports = CustomerReport.objects.count()
        
        # Unique customers count
        unique_customers = CustomerReport.objects.values('customer_name').distinct().count()
        
        # Optional: Recent reports (last 30 days)
        recent_reports = CustomerReport.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # Optional: Reports per customer statistics
        customer_stats = CustomerReport.objects.values('customer_name').annotate(
            report_count=Count('id')
        ).order_by('-report_count')[:5]  # Top 5 customers
        
        return Response({
            'total_reports': total_reports,
            'unique_customers': unique_customers,
            'recent_reports': recent_reports,
            'top_customers': [
                {
                    'name': stat['customer_name'],
                    'report_count': stat['report_count']
                }
                for stat in customer_stats
            ]
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=500)
        
        
        