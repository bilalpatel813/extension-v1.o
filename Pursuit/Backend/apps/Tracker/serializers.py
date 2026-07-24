from rest_framework import serializers
from .models import JobApplication
#Tracker Serializer
class TrackerSerializer(serializers.ModelSerializer):
    class Meta:
        model= JobApplication
        fields = '__all__'
        read_only_fields = ['user']      