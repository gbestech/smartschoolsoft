from django.urls import path
from . import views

urlpatterns = [
    path('refund-requests/', views.refund_request_list_create, name='refund-request-list'),
    path('refund-requests/<int:pk>/', views.refund_request_detail, name='refund-request-detail'),
    path('refund-requests/<int:pk>/process/', views.process_refund, name='process-refund'),
    path('refund-requests/<int:pk>/approve/', views.approve_refund, name='approve-refund'),
    path('refund-requests/<int:pk>/reject/', views.reject_refund, name='reject-refund'),
]

# from django.urls import path
# from . import views

# urlpatterns = [
#     path('', views.refund_request_list_create, name='refund-request-list'),
#     path('<int:pk>/', views.refund_request_detail, name='refund-request-detail'),
#     path('<int:pk>/process/', views.process_refund, name='process-refund'),
#     path('<int:pk>/approve/', views.approve_refund, name='approve-refund'),
#     path('<int:pk>/reject/', views.reject_refund, name='reject-refund'),
# ]