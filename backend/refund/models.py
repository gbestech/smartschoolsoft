# from django.db import models
# from django.conf import settings
# from django.utils import timezone

# class RefundRequest(models.Model):
#     STATUS_CHOICES = [
#         ('pending', 'Pending'),
#         ('approved', 'Approved'),
#         ('rejected', 'Rejected'),
#         ('processed', 'Processed'),
#     ]
    
#     sale = models.ForeignKey('sales.Sale', on_delete=models.CASCADE, related_name='refund_requests')
#     reason = models.TextField()
#     requested_amount = models.DecimalField(max_digits=10, decimal_places=2)
#     refunded_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
#     is_partial = models.BooleanField(default=False)
    
#     # User tracking - using settings.AUTH_USER_MODEL
#     created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='refund_requests_created')
#     approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='refunds_approved')
    
#     # Timestamps
#     created_at = models.DateTimeField(auto_now_add=True)
#     approved_at = models.DateTimeField(null=True, blank=True)
#     processed_at = models.DateTimeField(null=True, blank=True)
    
#     def __str__(self):
#             return f"Refund #{self.id} - {self.sale.customer_name}"

# class RefundItem(models.Model):
#     refund_request = models.ForeignKey(RefundRequest, on_delete=models.CASCADE, related_name='refunded_items')
#     sale_item = models.ForeignKey('sales.SaleItem', on_delete=models.CASCADE)
#     quantity = models.PositiveIntegerField()
    
#     def __str__(self):
#         return f"{self.sale_item.product} x {self.quantity}"



from django.db import models
from django.conf import settings
from django.utils import timezone

class RefundRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('processed', 'Processed'),
    ]
    
    sale = models.ForeignKey('sales.Sale', on_delete=models.CASCADE, related_name='refund_requests')
    reason = models.TextField()  # Keep as TextField for flexibility
    requested_amount = models.DecimalField(max_digits=10, decimal_places=2)
    refunded_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_partial = models.BooleanField(default=False)
    
    # User tracking
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='refund_requests_created')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='refunds_approved')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Refund #{self.id} - {self.sale.customer_name}"

class RefundItem(models.Model):
    refund_request = models.ForeignKey(RefundRequest, on_delete=models.CASCADE, related_name='refunded_items')
    sale_item = models.ForeignKey('sales.SaleItem', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    
    def __str__(self):
        return f"{self.sale_item.product} x {self.quantity}"