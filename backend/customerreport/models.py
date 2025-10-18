from django.db import models
from django.utils import timezone
from product.models import Product  # ✅ adjust this import to match your app name

class CustomerReport(models.Model):
    customer_name = models.CharField(max_length=255)
    report_date = models.DateField(default=timezone.now)
    message = models.TextField()
    products = models.ManyToManyField(Product, related_name="customer_reports")  # ✅ new field
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report from {self.customer_name} on {self.report_date}"
