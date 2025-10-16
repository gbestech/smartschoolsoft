from rest_framework import serializers
from .models import Sale, SaleItem
from product.models import Product
from decimal import Decimal, InvalidOperation
from django.db import transaction


class SaleItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = SaleItem
        fields = ["product", "qty", "price"]


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    gender = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Sale
        fields = [
            "id",
            "customer_name",
            "address",
            "phone",
            "gender",
            "date",
            "total",
            "amount_paid",
            "balance",
            "items",
        ]
        read_only_fields = ("total", "balance")

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        
        # Normalize amount_paid to Decimal
        try:
            amount_paid = Decimal(str(validated_data.get("amount_paid", "0") or "0"))
        except (InvalidOperation, TypeError):
            amount_paid = Decimal("0.00")

        # Use atomic transaction
        with transaction.atomic():
            # Create the Sale with amount_paid included
            sale = Sale.objects.create(
                customer_name=validated_data.get("customer_name"),
                address=validated_data.get("address"),
                phone=validated_data.get("phone"),
                gender=validated_data.get("gender"),
                date=validated_data.get("date"),
                amount_paid=amount_paid,
                total=Decimal("0.00"),  # Initialize to zero
                balance=Decimal("0.00")  # Initialize to zero
            )

            total_sale_amount = Decimal("0.00")

            for item in items_data:
                product = item.get("product")
                qty = int(item.get("qty") or 0)

                # Skip if quantity is 0
                if qty <= 0:
                    continue

                # Determine price
                price = None
                if item.get("price") is not None:
                    try:
                        price = Decimal(str(item.get("price")))
                    except (InvalidOperation, TypeError):
                        pass

                # Fallback to product price
                if price is None:
                    if hasattr(product, "selling_price") and product.selling_price:
                        price = Decimal(str(product.selling_price))
                    elif hasattr(product, "price") and product.price:
                        price = Decimal(str(product.price))
                    else:
                        price = Decimal("0.00")

                # Stock check
                if product.quantity < qty:
                    raise serializers.ValidationError(
                        f"Not enough stock for {product.name}. Available: {product.quantity}, Requested: {qty}"
                    )

                # Reduce stock and save
                product.quantity -= qty
                product.save(update_fields=["quantity"])
                
                # Refresh from database to confirm the save
                product.refresh_from_db()

                # Create sale item
                SaleItem.objects.create(
                    sale=sale,
                    product=product,
                    qty=qty,
                    price=price
                )

                # Accumulate total
                item_total = Decimal(str(qty)) * price
                total_sale_amount += item_total

            # Update sale with final totals
            sale.total = total_sale_amount.quantize(Decimal("0.01"))
            sale.amount_paid = amount_paid.quantize(Decimal("0.01"))
            sale.balance = (sale.total - sale.amount_paid).quantize(Decimal("0.01"))
            
            # Ensure balance is non-negative
            if sale.balance < Decimal("0.00"):
                sale.balance = Decimal("0.00")
            
            sale.save(update_fields=["total", "amount_paid", "balance"])

        # Refresh sale to return the saved state
        sale.refresh_from_db()
        return sale