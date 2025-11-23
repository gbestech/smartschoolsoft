from django.contrib import admin

# Register your models here.
from .models import RefundItem, RefundRequest
admin.site.register(RefundRequest)

admin.site.register(RefundItem)