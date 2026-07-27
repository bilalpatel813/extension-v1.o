from django.urls import path,include
from .views import SignUpAPI,Me ,  LoginAPI,LogOutAPI,ChangePassAPI
from rest_framework.routers import DefaultRouter
# users urls
router = DefaultRouter()
urlpatterns = [
    path('register/', SignUpAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('logout/', LogOutAPI.as_view(), name='logout'),
    path('me/', Me.as_view(), name='me'),
    path('change-pass/',ChangePassAPI.as_view(), name='change-pass'),
]
