from django.urls import path,include
from .views import SignUpAPI, LoginAPI
# users urls
urlpatterns = [
    path('register/', SignUpAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
]