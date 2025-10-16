from django.urls import path
from . import views
from django.urls import re_path

urlpatterns = [
    # Basic CRUD operations
    re_path(r'^products/$', views.product_list_create, name='product'),
    path('products/<int:pk>/', views.product_detail, name='product-detail'),
    
   
]
