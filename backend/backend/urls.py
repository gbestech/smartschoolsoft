from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('auth_app.urls')),
    path('api/', include('product.urls')),  # Replace 'yourapp' with your app name
    path('api-auth/', include('rest_framework.urls')),  
    path("api/sales/", include("sales.urls")),
]
