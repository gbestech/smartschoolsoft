# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from django.http import JsonResponse
# from django.views.decorators.http import require_GET
# from django.db.models import Sum, F
# from rest_framework import status
# from rest_framework.permissions import AllowAny
# from django.contrib.auth.models import Group
# from .models import Sale, SaleItem
# from .serializers import SaleSerializer, SaleItemSerializer
# import json


# # ✅ List all sales OR create a new sale
# @api_view(["GET", "POST"])
# @permission_classes([AllowAny])  # You can adjust permissions later
# def sale_list_create(request):
#     if request.method == "GET":
#         sales = Sale.objects.all().prefetch_related('items')
#         serializer = SaleSerializer(sales, many=True)
#         return Response(serializer.data)

#     elif request.method == "POST":
#         try:
#             # Handle form data with file upload
#             data = request.data.copy()
            
#             # Extract items data from form data
#             items_data = []
#             i = 0
#             while True:
#                 product_key = f'items[{i}]product'
#                 qty_key = f'items[{i}]qty'
#                 price_key = f'items[{i}]price'
                
#                 if product_key not in data:
#                     break
                    
#                 items_data.append({
#                     'product': data[product_key],
#                     'qty': data[qty_key],
#                     'price': data[price_key]
#                 })
#                 i += 1

#             # Create sale without items first
#             sale_data = {
#                 'customer_name': data.get('customer_name', ''),
#                 'address': data.get('address', ''),
#                 'phone': data.get('phone', ''),
#                 'gender': data.get('gender', ''),
#                 'payment_method': data.get('payment_method', 'cash'),
#                 'date': data.get('date'),
#                 'total': data.get('total', 0),
#                 'amount_paid': data.get('amount_paid', 0),
#                 'balance': data.get('balance', 0),
#             }
            
#             # Handle receipt file upload
#             if 'receipt' in request.FILES:
#                 sale_data['receipt'] = request.FILES['receipt']

#             serializer = SaleSerializer(data=sale_data)
#             if serializer.is_valid():
#                 sale = serializer.save()

#                 # Create sale items
#                 for item_data in items_data:
#                     SaleItem.objects.create(
#                         sale=sale,
#                         product_id=item_data['product'],
#                         qty=item_data['qty'],
#                         price=item_data['price']
#                     )

#                 # Update sale total based on actual items
#                 sale.update_total()
                
#                 # Return the complete sale with items
#                 complete_serializer = SaleSerializer(sale)
#                 return Response(complete_serializer.data, status=status.HTTP_201_CREATED)
            
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         except Exception as e:
#             return Response(
#                 {"error": f"Failed to create sale: {str(e)}"}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )


# @api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
# def sale_detail(request, pk):
#     try:
#         sale = Sale.objects.get(pk=pk)
#     except Sale.DoesNotExist:
#         return Response(status=status.HTTP_404_NOT_FOUND)

#     if request.method == 'GET':
#         serializer = SaleSerializer(sale)
#         return Response(serializer.data)
    
#     elif request.method in ['PUT', 'PATCH']:
#         try:
#             data = request.data.copy()
            
#             # Handle file upload for PUT/PATCH
#             if 'receipt' in request.FILES:
#                 data['receipt'] = request.FILES['receipt']
#             elif 'receipt' in data and data['receipt'] == '':
#                 # Clear receipt if empty string is sent
#                 data['receipt'] = None

#             serializer = SaleSerializer(sale, data=data, partial=request.method == 'PATCH')
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response(serializer.data)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#         except Exception as e:
#             return Response(
#                 {"error": f"Failed to update sale: {str(e)}"}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     elif request.method == 'DELETE':
#         sale.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# # ✅ Filter sales between two dates
# @require_GET
# def sales_by_date(request):
#     start_date = request.GET.get("start_date")
#     end_date = request.GET.get("end_date")

#     if not start_date or not end_date:
#         return JsonResponse(
#             {"error": "Please provide start_date and end_date"},
#             status=400,
#         )

#     sales = (
#         SaleItem.objects.filter(sale__date__range=[start_date, end_date])
#         .values("product__id", "product__name", "sale__date")
#         .annotate(
#             total_qty=Sum("qty"),
#             total_amount=Sum(F("qty") * F("price")),
#         )
#         .order_by("sale__date")
#     )

#     data = [
#         {
#             "id": item["product__id"],
#             "product": item["product__name"],
#             "quantity": item["total_qty"],
#             "total": item["total_amount"],
#             "date": item["sale__date"],
#         }
#         for item in sales
#     ]

#     return JsonResponse(data, safe=False)


# # ✅ Group management (optional)
# @api_view(["GET", "POST"])
# @permission_classes([AllowAny])
# def group_list_create(request):
#     if request.method == "GET":
#         groups = Group.objects.all()
#         serializer = GroupSerializer(groups, many=True)
#         return Response(serializer.data)

#     if request.method == "POST":
#         serializer = GroupSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# # ✅ Additional endpoint to get sale statistics
# @api_view(["GET"])
# @permission_classes([AllowAny])
# def sales_statistics(request):
#     total_sales = Sale.objects.count()
#     total_revenue = Sale.objects.aggregate(total=Sum('total'))['total'] or 0
#     total_paid = Sale.objects.aggregate(total=Sum('amount_paid'))['total'] or 0
#     total_balance = Sale.objects.aggregate(total=Sum('balance'))['total'] or 0
    
#     # Payment method statistics
#     payment_stats = Sale.objects.values('payment_method').annotate(
#         count=Count('id'),
#         total_amount=Sum('total')
#     )
    
#     return Response({
#         'total_sales': total_sales,
#         'total_revenue': float(total_revenue),
#         'total_paid': float(total_paid),
#         'total_balance': float(total_balance),
#         'payment_methods': list(payment_stats)
#     })

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.db.models import Sum, F, Count
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import Group
from .models import Sale, SaleItem
from product.models import Product
from .serializers import SaleSerializer, SaleItemSerializer
from django.db import transaction
import json
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Refund, Sale
from .serializers import RefundSerializer

# ✅ List all sales OR create a new sale
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def sale_list_create(request):
    if request.method == "GET":
        sales = Sale.objects.all().prefetch_related('items').order_by('-date', '-id')
        serializer = SaleSerializer(sales, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        try:
            # Handle form data with file upload
            data = request.data.copy()
            
            # Extract items data from form data
            items_data = []
            i = 0
            while True:
                product_key = f'items[{i}]product'
                qty_key = f'items[{i}]qty'
                price_key = f'items[{i}]price'
                
                if product_key not in data:
                    break
                    
                items_data.append({
                    'product': int(data[product_key]),
                    'qty': int(data[qty_key]),
                    'price': float(data[price_key])
                })
                i += 1

            if not items_data:
                return Response(
                    {"error": "Sale must have at least one item"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ✅ VALIDATE STOCK AVAILABILITY BEFORE CREATING SALE
            print("🔍 Checking product availability...")
            for item_data in items_data:
                try:
                    product = Product.objects.get(id=item_data['product'])
                    print(f"Product: {product.name}, Available: {product.quantity}, Requested: {item_data['qty']}")
                    
                    # Check if enough stock is available
                    if product.quantity < item_data['qty']:
                        return Response({
                            'error': f'Insufficient stock for {product.name}. Available: {product.quantity}, Requested: {item_data["qty"]}'
                        }, status=status.HTTP_400_BAD_REQUEST)
                        
                except Product.DoesNotExist:
                    return Response({
                        'error': f'Product with ID {item_data["product"]} not found'
                    }, status=status.HTTP_404_NOT_FOUND)

            # Use database transaction to ensure atomicity
            with transaction.atomic():
                # Create sale without items first
                sale_data = {
                    'customer_name': data.get('customer_name', ''),
                    'address': data.get('address', ''),
                    'phone': data.get('phone', ''),
                    'gender': data.get('gender', ''),
                    'payment_method': data.get('payment_method', 'cash'),
                    'date': data.get('date'),
                    'total': data.get('total', 0),
                    'amount_paid': data.get('amount_paid', 0),
                    'balance': data.get('balance', 0),
                }
                
                # Handle receipt file upload
                if 'receipt' in request.FILES:
                    sale_data['receipt'] = request.FILES['receipt']

                serializer = SaleSerializer(data=sale_data)
                if serializer.is_valid():
                    sale = serializer.save()
                    print(f"✅ Sale created: #{sale.id}")

                    # ✅ Create sale items AND REDUCE PRODUCT STOCK
                    for item_data in items_data:
                        # Create sale item
                        sale_item = SaleItem.objects.create(
                            sale=sale,
                            product_id=item_data['product'],
                            qty=item_data['qty'],
                            price=item_data['price']
                        )
                        print(f"✅ Sale item created: {sale_item}")
                        
                        # ✅ REDUCE PRODUCT QUANTITY
                        product = Product.objects.select_for_update().get(id=item_data['product'])
                        old_quantity = product.quantity
                        product.quantity -= item_data['qty']
                        product.save()
                        
                        print(f"✅ Reduced {product.name} stock: {old_quantity} → {product.quantity} (sold: {item_data['qty']})")

                    # Update sale total based on actual items
                    sale.update_total()
                    print(f"✅ Sale total updated: ₦{sale.total}")
                    
                    # Return the complete sale with items
                    complete_serializer = SaleSerializer(sale)
                    return Response(complete_serializer.data, status=status.HTTP_201_CREATED)
                
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Failed to create sale: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def sale_detail(request, pk):
    try:
        sale = Sale.objects.get(pk=pk)
    except Sale.DoesNotExist:
        return Response(
            {"error": "Sale not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = SaleSerializer(sale)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        try:
            data = request.data.copy()
            
            # Handle file upload for PUT/PATCH
            if 'receipt' in request.FILES:
                data['receipt'] = request.FILES['receipt']
            elif 'receipt' in data and data['receipt'] == '':
                # Clear receipt if empty string is sent
                data['receipt'] = None

            serializer = SaleSerializer(sale, data=data, partial=request.method == 'PATCH')
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response(
                {"error": f"Failed to update sale: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    elif request.method == 'DELETE':
        try:
            with transaction.atomic():
                # ✅ RESTORE PRODUCT STOCK WHEN DELETING SALE
                print(f"🗑️ Deleting sale #{sale.id} and restoring stock...")
                
                for item in sale.items.all():
                    product = Product.objects.select_for_update().get(id=item.product.id)
                    old_quantity = product.quantity
                    product.quantity += item.qty
                    product.save()
                    
                    print(f"✅ Restored {product.name} stock: {old_quantity} → {product.quantity} (returned: {item.qty})")
                
                sale.delete()
                print(f"✅ Sale #{pk} deleted successfully")
                
            return Response(
                {"message": "Sale deleted and stock restored successfully"}, 
                status=status.HTTP_204_NO_CONTENT
            )
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Failed to delete sale: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


# ✅ Filter sales between two dates
@require_GET
def sales_by_date(request):
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")

    if not start_date or not end_date:
        return JsonResponse(
            {"error": "Please provide start_date and end_date"},
            status=400,
        )

    sales = (
        SaleItem.objects.filter(sale__date__range=[start_date, end_date])
        .values("product__id", "product__name", "sale__date")
        .annotate(
            total_qty=Sum("qty"),
            total_amount=Sum(F("qty") * F("price")),
        )
        .order_by("sale__date")
    )

    data = [
        {
            "id": item["product__id"],
            "product": item["product__name"],
            "quantity": item["total_qty"],
            "total": float(item["total_amount"]) if item["total_amount"] else 0,
            "date": item["sale__date"],
        }
        for item in sales
    ]

    return JsonResponse(data, safe=False)


# ✅ Additional endpoint to get sale statistics
@api_view(["GET"])
@permission_classes([AllowAny])
def sales_statistics(request):
    total_sales = Sale.objects.count()
    total_revenue = Sale.objects.aggregate(total=Sum('total'))['total'] or 0
    total_paid = Sale.objects.aggregate(total=Sum('amount_paid'))['total'] or 0
    total_balance = Sale.objects.aggregate(total=Sum('balance'))['total'] or 0
    
    # Payment method statistics
    payment_stats = Sale.objects.values('payment_method').annotate(
        count=Count('id'),
        total_amount=Sum('total')
    )
    
    return Response({
        'total_sales': total_sales,
        'total_revenue': float(total_revenue),
        'total_paid': float(total_paid),
        'total_balance': float(total_balance),
        'payment_methods': list(payment_stats)
    })
    
    
    
   # sales/views.py


class RefundCreateView(generics.CreateAPIView):
    queryset = Refund.objects.all()
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Set the processed_by field to current user's username
        serializer.save(processed_by=self.request.user.username)
        
        # Update the sale status
        sale = serializer.validated_data['sale']
        refund_amount = serializer.validated_data['refund_amount']
        
        # Update sale amount_paid and set refund status
        new_amount_paid = sale.amount_paid - refund_amount
        is_fully_refunded = new_amount_paid == 0
        
        sale.amount_paid = max(new_amount_paid, 0)
        sale.is_refunded = is_fully_refunded
        sale.is_partially_refunded = not is_fully_refunded and new_amount_paid > 0
        sale.refund_reason = serializer.validated_data['reason']
        sale.save()

class RefundListView(generics.ListAPIView):
    queryset = Refund.objects.all()
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]

class RefundDetailView(generics.RetrieveAPIView):
    queryset = Refund.objects.all()
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated] 