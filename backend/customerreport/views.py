from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import CustomerReport
from .serializers import CustomerReportSerializer

class CustomerReportListCreateView(generics.ListCreateAPIView):
    queryset = CustomerReport.objects.all()
    serializer_class = CustomerReportSerializer

class CustomerReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomerReport.objects.all()
    serializer_class = CustomerReportSerializer

@api_view(['POST'])
def create_report(request):
    serializer = CustomerReportSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Report submitted successfully!',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'message': 'Error submitting report',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)