from django.db import models
from django.core.validators import EmailValidator, URLValidator
from django.utils import timezone


class Supplier(models.Model):
    """
    Model to store supplier/vendor information
    """
    
    TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('company', 'Company'),
        ('wholesaler', 'Wholesaler'),
        ('manufacturer', 'Manufacturer'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=255, help_text="Supplier name")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='company')
    email = models.EmailField(validators=[EmailValidator()], help_text="Supplier email")
    phone = models.CharField(max_length=20, help_text="Contact phone number")
    website = models.URLField(blank=True, null=True, validators=[URLValidator()])
    
    # Address Information
    address = models.TextField(help_text="Full address")
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='Nigeria')
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    
    # Company Information
    company_name = models.CharField(max_length=255, blank=True, null=True, help_text="Legal company name")
    tax_id = models.CharField(max_length=50, blank=True, null=True, help_text="Tax identification number")
    registration_number = models.CharField(max_length=50, blank=True, null=True, help_text="Business registration number")
    
    # Contact Person
    contact_person = models.CharField(max_length=255, blank=True, null=True, help_text="Primary contact person")
    contact_position = models.CharField(max_length=100, blank=True, null=True, help_text="Contact person's position")
    
    # Banking Information
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=50, blank=True, null=True)
    account_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Status and Notes
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    notes = models.TextField(blank=True, null=True, help_text="Additional notes about supplier")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
  
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
    
    def get_full_address(self):
        """Return formatted full address"""
        parts = [self.address, self.city, self.state, self.country]
        if self.postal_code:
            parts.append(self.postal_code)
        return ', '.join(filter(None, parts))
    
    def is_active(self):
        """Check if supplier is active"""
        return self.status == 'active'
