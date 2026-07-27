from rest_framework import serializers
from .models import User
# users serializer
class RegisterSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ['full_name','email','password']
    def create(self, validated_data):
            user = User.objects.create_user(**validated_data)
            
        