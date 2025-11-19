from django.db import models

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('ELECTRONICS', 'Electronics'),
        ('FRUIT', 'Fruit'),
        ('DRINKS', 'Drinks'),
        ('GRAIN', 'Grain'),
        ('FOOD', 'Food'),
        ('MEDICINE', 'Medicine'),
        ('COSMETICS', 'Cosmetics'),
        ('STATIONERY', 'Stationery'),
    ]
    
    # Existing fields
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='ELECTRONICS')
    
    # ✅ NEW: Inventory fields
    expiry_date = models.DateField(null=True, blank=True)
    manufacturing_date = models.DateField(null=True, blank=True)
    batch_number = models.CharField(max_length=100, blank=True)
    supplier = models.CharField(max_length=200, blank=True)
    min_stock_level = models.IntegerField(default=0)
    max_stock_level = models.IntegerField(null=True, blank=True)
    barcode = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True)
    weight = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    dimensions = models.CharField(max_length=100, blank=True)
    is_perishable = models.BooleanField(default=False)
    reorder_point = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name