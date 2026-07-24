from django.urls import path,include
from apps.Tracker.views import TrackerAPI
from rest_framework.routers import DefaultRouter
#api-route urls.py

router = DefaultRouter()
router.register("applications",TrackerAPI,basename= "applications")
urlpatterns =[
path('api/',include(router.urls))
]