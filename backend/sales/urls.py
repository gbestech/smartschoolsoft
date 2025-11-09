from django.urls import path
from . import views

urlpatterns = [
    path('sales/', views.sale_list_create, name='sale-list-create'),
    path('sales/<int:pk>/', views.sale_detail, name='sale-detail'),
    path('sales-by-date/', views.sales_by_date, name='sales-by-date'),
    path('sales-statistics/', views.sales_statistics, name='sales-statistics'),
]