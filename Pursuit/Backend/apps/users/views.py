from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from .serializers import RegisterSerializer , LoginSerializer
from .models import User
# Create your views here.
#users views 
class SignUpAPI(generics.CreateAPIView):
    queryset = User.objects.all() 
    serializer_class = RegisterSerializer
    permission_classes= [permissions.AllowAny]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
        "user": serializer.data,
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }, status=201)
 
 
class LoginAPI(APIView):
    def post(self,request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)
            return Response({
              "refresh": str(refresh),
              "access": str(refresh.access_token),
              "message":"Login Successfully"
        },status = status.HTTP_200_OK)
      
        return Response(
           serializer.errors,
           status = status.HTTP_400_BAD_REQUEST
            )   
            
             
       
    
       
    