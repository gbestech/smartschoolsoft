from django.db import models
# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('user', 'User'),
        ('staff', 'Staff'),
        ('inspector', 'Inspector'),
        ('manager', 'Manager'),
        ('admin', 'Admin'),
    )
    
    user_type = models.CharField(
        max_length=20, 
        choices=USER_TYPE_CHOICES, 
        default='user'
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    def save(self, *args, **kwargs):
        # Automatically set is_staff and is_superuser based on user_type
        if self.user_type == 'admin':
            self.is_staff = True
            self.is_superuser = True
        elif self.user_type in ['manager', 'staff', 'inspector']:
            self.is_staff = True
            self.is_superuser = False
        else:
            self.is_staff = False
            self.is_superuser = False
        
        super().save(*args, **kwargs)