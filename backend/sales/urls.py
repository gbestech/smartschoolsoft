from django.urls import path
from . import views
from .views import RefundCreateView, RefundListView, RefundDetailView
urlpatterns = [
    path('sales/', views.sale_list_create, name='sale-list-create'),
    path('sales/<int:pk>/', views.sale_detail, name='sale-detail'),
    path('sales-by-date/', views.sales_by_date, name='sales-by-date'),
    path('sales-statistics/', views.sales_statistics, name='sales-statistics'),
    
    path('', RefundListView.as_view(), name='refund-list'),
    path('create/', RefundCreateView.as_view(), name='refund-create'),
    path('<int:pk>/', RefundDetailView.as_view(), name='refund-detail'),
]