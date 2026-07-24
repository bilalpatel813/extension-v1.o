from django.urls import path,include
from apps.Tacker.views import TrackerAPI
from rest_framework.routers import DefaultRouter
# Tracker urls.py
router = DefaultRouter()
router.register("Tracker",TrackerAPI,basename="Tracker")
urlpatterns= [ 
path("",include(router.urls))
]