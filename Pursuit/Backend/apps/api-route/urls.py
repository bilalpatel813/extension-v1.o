from django.urls import path,include
from apps.Tracker.views import ApplicationAPI
from apps.users.views import ProfileAPI
from rest_framework.routers import DefaultRouter
#api-route urls.py

router = DefaultRouter()
router.register("applications",ApplicationAPI,basename= "applications")

urlpatterns =[
path('api/',include(router.urls)),
path('api/profile/', ProfileAPI.as_view(), name='profile'),
]