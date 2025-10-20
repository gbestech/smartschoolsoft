from django.db import models
from product.models import Product


class Sale(models.Model):
    customer_name = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    gender = models.CharField(
        max_length=10,
        choices=[("Male", "Male"), ("Female", "Female")],
        blank=True,
        null=True,
    )
    date = models.DateField(auto_now_add=True, blank=True, null=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)

    # Payment fields
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)

    def save(self, *args, **kwargs):
        # Avoid errors when sale has no items yet
        if self.pk:  # only calculate if sale already exists
            self.total = sum(
                (item.qty or 0) * (item.price or 0)
                for item in self.items.all()
            )
        else:
            self.total = self.total or 0

        total = self.total or 0
        paid = self.amount_paid or 0
        balance = total - paid

        if balance < 0:
            balance = 0

        self.balance = balance
        super().save(*args, **kwargs)

    def update_total(self):
        """Recalculate total and balance when items change."""
        self.total = sum(
            (item.qty or 0) * (item.price or 0)
            for item in self.items.all()
        )
        total = self.total or 0
        paid = self.amount_paid or 0
        self.balance = max(total - paid, 0)
        super().save(update_fields=["total", "balance"])

    def __str__(self):
        return f"Sale #{self.id} - {self.customer_name}"


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, related_name="items", on_delete=models.CASCADE, blank=True, null=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    qty = models.PositiveIntegerField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    

    def save(self, *args, **kwargs):
        if not self.price:
            self.price = self.product.price

        super().save(*args, **kwargs)

        # Automatically update the parent sale total and balance
        if self.sale:
            self.sale.update_total()

    def __str__(self):
        return f"{self.product.name} x {self.qty} @ {self.price}"