from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.db.models import Sum, F
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import Group
from .models import Sale, SaleItem
from .serializers import SaleSerializer


# ✅ List all sales OR create a new sale
@api_view(["GET", "POST"])
@permission_classes([AllowAny])  # You can adjust permissions later
def sale_list_create(request):
    if request.method == "GET":
        sales = Sale.objects.all()
        serializer = SaleSerializer(sales, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = SaleSerializer(data=request.data)
        if serializer.is_valid():
            sale = serializer.save()

            # Automatically calculate balance if amount_paid is included
            amount_paid = serializer.validated_data.get("amount_paid", 0)
            total_amount = sale.total_amount if hasattr(sale, "total_amount") else 0
            sale.balance = total_amount - amount_paid
            sale.save()

            updated_serializer = SaleSerializer(sale)
            return Response(updated_serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def sale_detail(request, pk):
    try:
        sale = Sale.objects.get(pk=pk)
    except Sale.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = SaleSerializer(sale)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = SaleSerializer(sale, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        sale.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



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
            "total": item["total_amount"],
            "date": item["sale__date"],
        }
        for item in sales
    ]

    return JsonResponse(data, safe=False)


# ✅ Group management (optional)
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def group_list_create(request):
    if request.method == "GET":
        groups = Group.objects.all()
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
