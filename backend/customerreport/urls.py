from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    path('api/reports/', views.CustomerReportListCreateView.as_view(), name='report-list-create'),
    path('api/reports/<int:pk>/', views.CustomerReportDetailView.as_view(), name='report-detail'),
    path('api/create-report/', views.create_report, name='create-report'),
    path('products/', views.product_list, name='product-list'),  # ✅ this line is important

  
    
]