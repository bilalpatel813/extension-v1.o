from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from .models import JobApplication
from .serializers import TrackerSerializer
# Create your views here.
# Tracker View
class TrackerAPI(ModelViewSet):
    serializer_class = TrackerSerializer
    permission_classes= [IsAuthenticated]
    filter_backend = [SearchFilter]
    search_fields = ['title','company']
    
    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)
    def perform_create(self,serializer):
            serializer.save(user=self.request.user)            
                        
