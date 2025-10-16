from django.db import models
from django.conf import settings

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('ELECTRONICS', 'Electronics'),
        ('FRUIT', 'Fruit'),
        ('DRINKS', 'Drinks'),
        ('GRAIN', 'Grain'),
    ]
    
    name = models.CharField(max_length=255, unique=True, )
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2,)  # Cost price
    selling_price = models.DecimalField(max_digits=10, decimal_places=2,default=0.00)
    quantity = models.IntegerField(default=0)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='ELECTRONICS')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='products'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def profit(self):
        return self.selling_price - self.price
    
    @property
    def profit_margin(self):
        if self.price > 0:
            return ((self.selling_price - self.price) / self.price) * 100
        return 0