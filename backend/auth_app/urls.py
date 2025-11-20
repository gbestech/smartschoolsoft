# from django.urls import path
# from . import views

# urlpatterns = [
#     path('api/register/', views.register_view, name='register'),
#     path('api/login/', views.login_view, name='login'),
#     path('api/logout/', views.logout_view, name='logout'),
#     path('api/dashboard/', views.user_dashboard, name='dashboard'),
#     path('api/profile/', views.get_user_profile, name='profile'),
# ]

from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('api/register/', views.register_view, name='register'),
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/dashboard/', views.user_dashboard, name='dashboard'),
    path('api/profile/', views.get_user_profile, name='profile'),
    
    # User management endpoints
    path('api/users/', views.user_list, name='user-list'),
    path('api/users/create/', views.create_user, name='user-create'),
    path('api/users/<int:user_id>/', views.user_detail, name='user-detail'),
    path('api/users/<int:user_id>/toggle-status/', views.toggle_user_status, name='user-toggle-status'),
    path('api/users/<int:user_id>/change-role/', views.change_user_role, name='user-change-role'),
]