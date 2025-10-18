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
