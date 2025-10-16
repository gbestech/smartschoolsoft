from django.urls import path
from . import views

urlpatterns = [
    path('sales/', views.sale_list_create, name='sale-list-create'),
    path('saless/<int:pk>/', views.sale_detail, name='sale-detail'),
]
