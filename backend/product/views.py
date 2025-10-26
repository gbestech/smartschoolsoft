# from django.shortcuts import render

# # Create your views here.
# from rest_framework import status
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from django.shortcuts import get_object_or_404
# from .models import Product
# from .serializers import ProductSerializer, ProductCreateSerializer

# @api_view(['GET', 'POST'])
# @permission_classes([IsAuthenticated])
# def product_list_create(request):
#     """
#     List all products or create a new product
#     """
#     if request.method == 'GET':
#         products = Product.objects.all()
#         serializer = ProductSerializer(products, many=True)
#         return Response(serializer.data)
    
#     elif request.method == 'POST':
#         serializer = ProductCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             # Add the current user as the creator
#             serializer.save(created_by=request.user)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['GET', 'PUT', 'DELETE'])
# @permission_classes([IsAuthenticated])
# def product_detail(request, pk):
#     """
#     Retrieve, update or delete a product instance
#     """
#     product = get_object_or_404(Product, pk=pk)
    
#     if request.method == 'GET':
#         serializer = ProductSerializer(product)
#         return Response(serializer.data)
    
#     elif request.method == 'PUT':
#         serializer = ProductCreateSerializer(product, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     elif request.method == 'DELETE':
#         product.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def product_by_category(request, category):
#     """
#     Get products by category
#     """
#     products = Product.objects.filter(category=category.upper())
#     serializer = ProductSerializer(products, many=True)
#     return Response(serializer.data)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def user_products(request):
#     """
#     Get products created by the current user
#     """
#     products = Product.objects.filter(created_by=request.user)
#     serializer = ProductSerializer(products, many=True)
#     return Response(serializer.data)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def low_stock_products(request):
#     """
#     Get products with low stock (quantity less than 10)
#     """
#     products = Product.objects.filter(quantity__lt=10)
#     serializer = ProductSerializer(products, many=True)
#     return Response(serializer.data)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def bulk_update_stock(request):
#     """
#     Bulk update product quantities
#     """
#     updates = request.data.get('updates', [])
#     results = []
    
#     for update in updates:
#         try:
#             product = Product.objects.get(id=update['product_id'])
#             product.quantity = update['quantity']
#             product.save()
#             results.append({
#                 'product_id': product.id,
#                 'name': product.name,
#                 'new_quantity': product.quantity,
#                 'status': 'success'
#             })
#         except Product.DoesNotExist:
#             results.append({
#                 'product_id': update['product_id'],
#                 'status': 'error',
#                 'message': 'Product not found'
#             })
#         except KeyError:
#             results.append({
#                 'status': 'error',
#                 'message': 'Invalid data format'
#             })
    
#     return Response(results)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializers import ProductSerializer

@api_view(['GET', 'POST'])
def product_list(request):
    if request.method == 'GET':
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)