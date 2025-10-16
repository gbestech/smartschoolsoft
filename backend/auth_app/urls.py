from django.urls import path
from . import views

urlpatterns = [
    path('api/register/', views.register_view, name='register'),
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/dashboard/', views.user_dashboard, name='dashboard'),
    path('api/profile/', views.get_user_profile, name='profile'),
]