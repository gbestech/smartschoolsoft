from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import RefundRequest, RefundItem
from .serializers import (
    RefundRequestSerializer, 
    RefundRequestCreateSerializer,
    ProcessRefundSerializer, 
    ApproveRejectSerializer
)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def refund_request_list_create(request):
    """
    List all refund requests or create a new refund request
    """
    if request.method == 'GET':
        if request.user.is_staff:
            refund_requests = RefundRequest.objects.all()
        else:
            refund_requests = RefundRequest.objects.filter(created_by=request.user)
        
        refund_requests = refund_requests.select_related('sale', 'created_by', 'approved_by').prefetch_related('refunded_items')
        serializer = RefundRequestSerializer(refund_requests, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = RefundRequestCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Create the refund request with the current user
            refund_request = serializer.save(created_by=request.user)
            return_serializer = RefundRequestSerializer(refund_request)
            return Response(return_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def refund_request_detail(request, pk):
    """
    Retrieve or update a refund request
    """
    refund_request = get_object_or_404(RefundRequest, pk=pk)
    
    # Check permission
    if not request.user.is_staff and refund_request.created_by != request.user:
        return Response(
            {'error': 'You do not have permission to view this refund request'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.method == 'GET':
        serializer = RefundRequestSerializer(refund_request)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = RefundRequestSerializer(refund_request, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_refund(request, pk):
    """
    Process an approved refund - update inventory and sale status
    """
    refund_request = get_object_or_404(RefundRequest, pk=pk)
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Only staff members can process refunds'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if refund_request.status != 'approved':
        return Response(
            {"error": "Only approved refunds can be processed"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = ProcessRefundSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            refund_amount = serializer.validated_data['refund_amount']
            restore_products = serializer.validated_data['restore_products']

            # Validate refund amount
            if refund_amount > refund_request.requested_amount:
                return Response(
                    {"error": "Refund amount cannot exceed requested amount"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 1. Restore product quantities to inventory
            if restore_products:
                _restore_products_to_inventory(refund_request)

            # 2. Update sale status and financials
            _update_sale_after_refund(refund_request.sale, refund_amount, refund_request.is_partial)

            # 3. Update refund request status
            refund_request.refunded_amount = refund_amount
            refund_request.status = 'processed'
            refund_request.processed_at = timezone.now()
            refund_request.save()

            return Response({
                "message": f"Refund of ₦{refund_amount} processed successfully",
                "products_restored": restore_products,
                "sale_updated": True
            })

    except Exception as e:
        return Response(
            {"error": f"Failed to process refund: {str(e)}"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

def _restore_products_to_inventory(refund_request):
    """Restore refunded products back to inventory"""
    try:
        if refund_request.is_partial:
            # Restore only selected items for partial refund
            for refund_item in refund_request.refunded_items.all():
                product = refund_item.sale_item.product
                if hasattr(product, 'quantity'):
                    product.quantity += refund_item.quantity
                    product.save()
        else:
            # Restore all items for full refund
            sale_items = refund_request.sale.items.all()
            for sale_item in sale_items:
                product = sale_item.product
                if hasattr(product, 'quantity'):
                    product.quantity += sale_item.quantity
                    product.save()
    except Exception as e:
        print(f"Error restoring products: {e}")

def _update_sale_after_refund(sale, refund_amount, is_partial):
    """Update sale after refund is processed"""
    try:
        # Update amount paid
        sale.amount_paid = max(sale.amount_paid - refund_amount, 0)
        
        # Update sale status based on refund type
        if is_partial:
            sale.is_partially_refunded = True
        else:
            sale.is_refunded = True
            sale.status = 'refunded'
        
        sale.save()
    except Exception as e:
        print(f"Error updating sale: {e}")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_refund(request, pk):
    """Approve a pending refund request"""
    refund_request = get_object_or_404(RefundRequest, pk=pk)
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Only staff members can approve refunds'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if refund_request.status != 'pending':
        return Response(
            {"error": "Only pending refunds can be approved"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    refund_request.status = 'approved'
    refund_request.approved_by = request.user
    refund_request.approved_at = timezone.now()
    refund_request.save()

    serializer = RefundRequestSerializer(refund_request)
    return Response({
        "message": "Refund request approved successfully",
        "refund_request": serializer.data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_refund(request, pk):
    """Reject a pending refund request"""
    refund_request = get_object_or_404(RefundRequest, pk=pk)
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Only staff members can reject refunds'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if refund_request.status != 'pending':
        return Response(
            {"error": "Only pending refunds can be rejected"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = ApproveRejectSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    rejection_reason = serializer.validated_data.get('rejection_reason', '')
    
    refund_request.status = 'rejected'
    if rejection_reason:
        refund_request.reason += f"\n\nRejection Reason: {rejection_reason}"
    refund_request.save()

    return_serializer = RefundRequestSerializer(refund_request)
    return Response({
        "message": "Refund request rejected",
        "refund_request": return_serializer.data
    })