from django.urls import path,include
from apps.Tracker.views import ApplicationAPI
from apps.users.views import ProfileAPI
from rest_framework.routers import DefaultRouter
#api-route urls.py

router = DefaultRouter()
router.register("applications",ApplicationAPI,basename= "applications")
router.register("profile",ProfileAPI,basename= "profile")
urlpatterns =[
path('api/',include(router.urls))
]