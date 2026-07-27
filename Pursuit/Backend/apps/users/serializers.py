from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
# users serializer
class RegisterSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ['full_name','email','password']
    def create(self, validated_data):
            user = User.objects.create_user(**validated_data)
            return user
   

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only = True)
    def validate(self,data):
        email  = data["email"]
        password = data["password"]
        user = authenticate(
        username= email,
        password = password
        )
        if user is None:
            raise serializers.ValidationError("Invalid Credential")
        data["user"] = user
        return data
         
           
        
            
        