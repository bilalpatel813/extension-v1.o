from django.db import models
import uuid
from django.contrib.auth.models import User
# Create your models here.
# tracker models

class JobApplication(models.Model):
    STATUS_CHOICES = [
        ("applied", "Applied"),
        ("interview", "Interview"),
        ("offer", "Offer"),
        ("rejected", "Rejected"),
        ("withdrawn", "Withdrawn"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
    User,
    on_delete=models.CASCADE,
    related_name="job_applications"
    )
    
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    url = models.URLField(blank=True)
    source = models.CharField(max_length=100, default="manual")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="applied")
    applied_at = models.DateTimeField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} - {self.company}"
    class Meta:
        db_table = "job_applications"