from django.urls import path,include
from .views import SignUpAPI
# users urls
urlpatterns = [
    path('register/', SignUpAPI.as_view(), name='register'),
]