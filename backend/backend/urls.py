from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings    
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('auth_app.urls')),
    path('api/', include('product.urls')),  # Replace 'yourapp' with your app name
    path('api-auth/', include('rest_framework.urls')),  
    path("api/sales/", include("sales.urls")),
    path("reports/", include("customerreport.urls")),
    path("api/", include("supplier.urls")),
   
    
]
if settings.DEBUG:
    if settings.DEBUG:
        urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)