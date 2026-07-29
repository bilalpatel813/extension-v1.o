from django.db import models
import uuid
from django.contrib.auth.models import AbstractUser
from .managers import UserManager
# Create your models here.
#users model 
class User(AbstractUser):
    username = None
    first_name = None
    last_name = None
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fullName = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    
    objects = UserManager()