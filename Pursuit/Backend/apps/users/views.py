from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from .serializers import RegisterSerializer
from .models import User
# Create your views here.
#users views 
class SignUpAPI(generics.CreateAPIView):
    queryset = User.objects.all() 
    serializer_class = RegisterSerializer
    permission_classes= [permissions.AllowAny]
    def create(self,request,*args,**kwargs):
        response = super().create(request,*args,**kwargs)
        user = User.objects.get(email=response.data['email'])
        print("refreash token generated! :")
        refresh = RefreshToken.for_user(user)
        print("signup refresh token!!: ",refresh)
        response.data['refresh'] = str(refresh)
        response.data['access'] = str(refresh.access_token)

        return response
    
       
    